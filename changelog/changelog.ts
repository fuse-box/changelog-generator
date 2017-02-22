import * as fs from 'fs';
import { IMileStoneWithIssues, ChangeLogTemplate } from './changelogTemplate';
import { IMilestones, IIssue } from './interfaces';
import * as Github from 'github';

import { GithubConfig } from '../github-config';
import { Observable } from '@reactivex/rxjs';

/**
 *
 * @author DrMabuse23 <https://github.com/DrMabuse23>
 * @export
 * @class ChangelogApi
 */
export class ChangelogApi {
  private github: Github;
  private _uri: string = 'https://api.github.com';
  private _cmd = ['-B', 'basic-auth', '-O', 'oauth'];
  private _args: string[];

  constructor(options: Github.Options = {}, private _owner: string = GithubConfig.repoOwner, private _repo: string = GithubConfig.repoName ) {
    this.github = new Github(Object.assign({
      // optional
      debug: true,
      protocol: "https",
      host: "api.github.com", // should be api.github.com for GitHub
      timeout: 5000
    }, options));
    this.authenticate(process.argv);
  }

  authenticate(args) {
    if (!args || args && !args[2]) {
      return;
    }
    const index = this._cmd.indexOf(args[2]);
    if (index !== -1) {
      console.log(this._cmd[index]);
      index < 2 ? this.basicAuth() : this.oauth();
    }
  }
  /**
   * concat owner/repo
   */
  private get repo() {
    return `${this._owner}/${this._repo}`;
  }

  /**
   * @description oauth
   * @memberOf ChangelogApi
   */
  public oauth(): any {
    if (!GithubConfig.username || GithubConfig.password) {
      return Promise.reject(new Error('GithubConfig.token is required for oauth.'));
    }
    return this.github.authenticate({
      type: "oauth",
      token: GithubConfig.token
    });
  }
  /**
   * @description basicAuth
   * @memberOf ChangelogApi
   */
  public basicAuth(): any {
    if (!GithubConfig.username || !GithubConfig.password) {
      return Promise.reject(new Error('GithubConfig.username, GithubConfig.password is required for basic Auth.'));
    }

    return this.github.authenticate({
      type: 'basic',
      username: GithubConfig.username,
      password: GithubConfig.password
    });
  }

  private _assignOwnerRepo(yours): any {
    return Object.assign(yours, { owner: this._owner, repo: this._repo });
  }
  /**
   * @link [milestones](https://developer.github.com/v3/issues/milestones/#list-milestones-for-a-repository)
   * @type {Observable<any>}
   * @memberOf ChangelogApi
   */
  public get milestones(): Observable<IMilestones.RootObject[]> {
    const options = this._assignOwnerRepo({
      state: 'closed'
    });
    return Observable.fromPromise(this.github.issues.getMilestones(options))
      .map((resp: any) => resp.data);
  }
  /**
  * @link [milestone](https://developer.github.com/v3/issues/milestones/#get-a-single-milestone)
  * @type {Observable<IMilestones.RootObject>}
  * @memberOf ChangelogApi
  */
  public getMilestone(id): Observable<IMilestones.RootObject> {
    const options = this._assignOwnerRepo({
      number: id
    });
    return Observable.fromPromise(this.github.issues.getMilestone(options))
      .map((resp: any) => resp.data);
  }
  /**
 * @link [issues for a repositors](https://developer.github.com/v3/issues/#list-issues-for-a-repository)
 * @type {Observable<{milestone:IMilestones.RootObject, issue?: IIssue.RootObject, error?: any }>}
 * @memberOf ChangelogApi
 */
  public getIssuesByMileStone(milestone): Observable<{ milestone: IMilestones.RootObject, issues?: IIssue.RootObject[], error?: any }> {
    const options: Github.IssuesGetForRepoParams = this._assignOwnerRepo({
      milestone: milestone.number,
      direction: 'asc',
      state: 'closed'
    });
    return Observable.fromPromise(this.github.issues.getForRepo(options).catch((e) => Promise.reject({ milestone: milestone, error: e })))
      .map((resp: any) => {
        return { milestone: milestone, issues: resp.data }
      });
  }
}



const api = new ChangelogApi();
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
