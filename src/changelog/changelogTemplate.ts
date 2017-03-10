import { h1 } from '../utils/Markdown';
import { h5 } from '../utils/Markdown';
import { noCase, link, table, altH1, humanDate, altH2 } from '../utils/Markdown';
import * as semver from 'semver';
import { IMilestones, IIssue } from './interfaces';
import { Observable } from '@reactivex/rxjs/dist/cjs/Observable';
import { ChangelogApi } from './changelog';
import * as rightPad from 'right-pad';

export interface IMileStoneWithIssues {
  milestone: IMilestones.RootObject;
  issues: IIssue.RootObject[];
}

export class ChangeLogTemplate {
  private _tableHeader: string[];
  private showFilter = ['id', 'title', 'comments'];

  constructor(private _milestones: IMileStoneWithIssues[]) {

  }

  sortByMileStone(a: IMileStoneWithIssues, b: IMileStoneWithIssues) {
    const c = a.milestone.title;
    const d = b.milestone.title;

    if (semver.gt(c, d)) {
      return -1;
    }

    if (semver.lt(c, d)) {
      return 1;
    }
    return 0;
  }

  getIssueTable(issues: IIssue.RootObject[]) {
    let title = ``;
    issues.forEach((issue) => {
      if (issue.pull_request) {
        title += `
${rightPad(link('PR ' + issue.number, issue.pull_request.html_url), 24, ' ')} | ${issue.title} | ${issue.closed_at ? humanDate(issue.closed_at) : '--'}
`
      } else {
        title += `
${rightPad(link('ISSUE ' + issue.number, issue.html_url), 24, ' ')} | ${issue.title} | ${issue.closed_at ? humanDate(issue.closed_at) : '--'}
`
      }
      return title;
    });
    return title;
  }

  createMd() {
    const milestonesMd = this._milestones
      .sort(this.sortByMileStone)
      .map((item) => {
        return `
${altH2(link(item.milestone.title, item.milestone.html_url))}\n\r
<p>${item.milestone.description}</p>
${this.getIssueTable(item.issues)}
                `;
      });
    let template = '';
    milestonesMd.forEach((milestoneMd) => template += milestoneMd);
    return template;
  }
}
