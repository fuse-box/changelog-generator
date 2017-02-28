import { IMileStoneWithIssues, ChangeLogTemplate } from './changelogTemplate';
import { IMilestones, IIssue, Config } from './interfaces';
import * as Github from 'github';
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
  private _username: string;
  private _password: string;

  constructor(public config: Config, options: Github.Options = {}) {
    this.github = new Github(Object.assign({
      // optional
      debug: true,
      protocol: 'https',
      host: 'api.github.com', // should be api.github.com for GitHub
      timeout: 5000
    }, options));
    this.authenticate(process.argv);
  }

  authenticate(args: any[]) {
    if (!args || args && !args[2]) {
      return ;
    }
    const index = this._cmd.indexOf(args[2]);
    if (index !== -1) {
      // console.log(this._cmd[index]);
      index < 2 ? this.basicAuth() : this.oauth();
    }
  }
  /**
   * concat owner/repo
   */
  private get repo() {
    return `${this.config.repoOwner}/${this.config.repoName}`;
  }

  /**
   * @description oauth
   * @memberOf ChangelogApi
   */
  public oauth(): any {
    if (!this.config.username || this.config.password) {
      return Promise.reject(new Error('this.config.token is required for oauth.'));
    }
    return this.github.authenticate({
      type: 'oauth',
      token: this.config.token
    });
  }
  /**
   * @description basicAuth
   * @memberOf ChangelogApi
   */
  public basicAuth(): any {
    if (!this.config.username || !this.config.password) {
      return Promise.reject(new Error('this.config.username, this.config.password is required for basic Auth.'));
    }

    return this.github.authenticate({
      type: 'basic',
      username: this.config.username,
      password: this.config.password
    });
  }

  private _assignOwnerRepo(yours: any): any {
    return Object.assign(yours, { owner: this.config.repoOwner, repo: this.config.repoName });
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
  public getMilestone(id: number): Observable<IMilestones.RootObject> {
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
  public getIssuesByMileStone(milestone: IMilestones.RootObject): Observable<{ milestone: IMilestones.RootObject, issues?: IIssue.RootObject[], error?: any }> {
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
