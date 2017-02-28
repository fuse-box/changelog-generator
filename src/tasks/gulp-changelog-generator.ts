import {Observer} from '@reactivex/rxjs/dist/cjs/Observer';
import {Observable} from '@reactivex/rxjs/dist/cjs/Observable';
import {ChangeLogTemplate} from '../changelog/changelogTemplate';
import {IMileStoneWithIssues} from '../changelog/changelogTemplate';
import {ChangelogApi} from '../changelog/changelog';

// through2 is a thin wrapper around node transform streams
import * as  through from 'through2'
import * as gutil from 'gulp-util';
import {Config} from '../changelog/interfaces';

const PluginError = gutil.PluginError;

// Consts
const PLUGIN_NAME = 'gulp-changelog-generator';

const prefixStream = (options: Config) => {
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

// Plugin level function(dealing with files)
export const gulpChangeLogGenerator = (options: Config) => {

  if (!options.repoName && !options.repoName) {
    throw new PluginError(PLUGIN_NAME, 'Missing prefix repo information!');
  }
  return prefixStream(options).subscribe((template: Buffer[]) => {
    return through.obj((file, enc, cb) => {
      if (file.isNull()) {
        // return empty file
        return cb(null, file);
      }
      if (file.isBuffer()) {
        file.contents = Buffer.concat([template, file.contents]);
      }
      if (file.isStream()) {
        file.contents = file.contents.pipe(template);
      }
      cb(null, file);
    });
  })
}

