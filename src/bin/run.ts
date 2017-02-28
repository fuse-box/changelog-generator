#!/usr/bin/env node

import {GithubConfig} from '../utils/github-config';
import * as fs from 'fs';
import {Observable} from '@reactivex/rxjs/dist/cjs/Observable';
import {ChangeLogTemplate} from '../changelog/changelogTemplate';
import {IMileStoneWithIssues} from '../changelog/changelogTemplate';
import {ChangelogApi} from '../changelog/changelog';

const api = new ChangelogApi(new GithubConfig());
const _milestones: IMileStoneWithIssues[] = [];
let template: ChangeLogTemplate;

api.milestones
  .flatMap((milestones) => Observable.from(milestones))
  .filter((_milestone) => {
    console.log(_milestone.title, _milestone.closed_issues, _milestone.open_issues);
    return _milestone.number !== null;
  })
  .flatMap((milestone) => {
    return api.getIssuesByMileStone(milestone);
  })
  .subscribe(
  (resp) => {
    _milestones.push(<IMileStoneWithIssues>resp);
    // console.log(JSON.stringify(resp, null, 2));
  },
  (e) => {
    console.error(e);
  },
  () => {
    const template = new ChangeLogTemplate(_milestones);
    fs.writeFileSync('./CHANGELOG.md', template.createMd());
    console.log(template.createMd());

  }
  );
