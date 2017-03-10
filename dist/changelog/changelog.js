"use strict";
var Github = require('github');
var rxjs_1 = require('@reactivex/rxjs');
var ChangelogApi = (function () {
    function ChangelogApi(config, options) {
        if (options === void 0) { options = {}; }
        this.config = config;
        this._uri = 'https://api.github.com';
        this._cmd = ['-B', 'basic-auth', '-O', 'oauth'];
        this.github = new Github(Object.assign({
            debug: true,
            protocol: 'https',
            host: 'api.github.com',
            timeout: 5000
        }, options));
        this.oauth();
    }
    Object.defineProperty(ChangelogApi.prototype, "repo", {
        get: function () {
            return this.config.repoOwner + "/" + this.config.repoName;
        },
        enumerable: true,
        configurable: true
    });
    ChangelogApi.prototype.oauth = function () {
        return this.github.authenticate({
            type: 'oauth',
            token: this.config.token
        });
    };
    ChangelogApi.prototype.basicAuth = function () {
        if (!this.config.username || !this.config.password) {
            return Promise.reject(new Error('this.config.username, this.config.password is required for basic Auth.'));
        }
        return this.github.authenticate({
            type: 'basic',
            username: this.config.username,
            password: this.config.password
        });
    };
    ChangelogApi.prototype._assignOwnerRepo = function (yours) {
        return Object.assign(yours, { owner: this.config.repoOwner, repo: this.config.repoName });
    };
    Object.defineProperty(ChangelogApi.prototype, "milestones", {
        get: function () {
            var options = this._assignOwnerRepo({
                state: 'closed'
            });
            return rxjs_1.Observable.fromPromise(this.github.issues.getMilestones(options))
                .map(function (resp) { return resp.data; });
        },
        enumerable: true,
        configurable: true
    });
    ChangelogApi.prototype.getMilestone = function (id) {
        var options = this._assignOwnerRepo({
            number: id
        });
        return rxjs_1.Observable.fromPromise(this.github.issues.getMilestone(options))
            .map(function (resp) { return resp.data; });
    };
    ChangelogApi.prototype.getIssuesByMileStone = function (milestone) {
        var options = this._assignOwnerRepo({
            milestone: milestone.number,
            direction: 'asc',
            state: 'closed'
        });
        return rxjs_1.Observable.fromPromise(this.github.issues.getForRepo(options).catch(function (e) { return Promise.reject({ milestone: milestone, error: e }); }))
            .map(function (resp) {
            return { milestone: milestone, issues: resp.data };
        });
    };
    return ChangelogApi;
}());
exports.ChangelogApi = ChangelogApi;
