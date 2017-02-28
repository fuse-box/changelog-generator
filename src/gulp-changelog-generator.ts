"use strict";

import {ChangelogApi} from './changelog/changelog';
import {Observer} from '@reactivex/rxjs/dist/cjs/Observer';
import {Observable} from '@reactivex/rxjs/dist/cjs/Observable';
import {IMileStoneWithIssues, ChangeLogTemplate} from './changelog/changelogTemplate';
import {Config} from './changelog/interfaces';

// through2 is a thin wrapper around node transform streams
import * as  through from 'through2'
import * as gutil from 'gulp-util';

const PluginError = gutil.PluginError;

// Consts
const PLUGIN_NAME = 'gulp-changelog-generator';

export const prefixStream = (options: Config) => {
  const api = new ChangelogApi(options);
  const _milestones: IMileStoneWithIssues[] = [];
  let template: ChangeLogTemplate;

  return Observable.create((ob: Observer<any>) => {
    api.milestones
      .flatMap((milestones) => Observable.from(milestones))
      .filter((_milestone) => {
        // console.log(_milestone.title, _milestone.closed_issues, _milestone.open_issues);
        return _milestone.number !== null;
      })
      .flatMap((milestone) => {
        return api.getIssuesByMileStone(milestone);
      })
      .subscribe(
        (resp) => {
          _milestones.push(<IMileStoneWithIssues>resp);
          // debugger;
        },
        (e) => {
          console.error(e);
        },
        () => {
          const template = new ChangeLogTemplate(_milestones);
          const stream = through();
          stream.write(new Buffer(template.createMd()));
          ob.next(stream);
          ob.complete();
        }
      )
  });
}

export const gulpChangeLogGeneratorPlugin = (options: Config) => {

  if (!options.repoName && !options.repoName) {
    throw new PluginError(PLUGIN_NAME, 'Missing prefix repo information!');
  }

  return through.obj((file, enc, cb) => {
    return prefixStream(options)
      .toPromise()
      .then((template: Buffer[]) => {
        if (file.isNull()) {
          // return empty file
          return cb(null, file);
        }
        if (file.isBuffer()) {
          throw new PluginError(PLUGIN_NAME, 'no Buffer support allowed! please use `gulp.src(\'file\', {buffer: false})`');
        }
        if (file.isStream()) {
          file.contents = file.contents.pipe(template);
        }
        return Promise.resolve(cb(null, file));
      })
      .catch((e:Error) => {
        throw new PluginError(PLUGIN_NAME, e.message);
      });
  });
}
