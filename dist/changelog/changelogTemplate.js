"use strict";
var Markdown_1 = require('../utils/Markdown');
var semver = require('semver');
var ChangeLogTemplate = (function () {
    function ChangeLogTemplate(_milestones) {
        this._milestones = _milestones;
        this.showFilter = ['id', 'title', 'comments'];
    }
    ChangeLogTemplate.prototype.sortByMileStone = function (a, b) {
        var c = a.milestone.title;
        var d = b.milestone.title;
        if (semver.gt(c, d)) {
            return -1;
        }
        if (semver.lt(c, d)) {
            return 1;
        }
        return 0;
    };
    ChangeLogTemplate.prototype.getIssueTable = function (issues) {
        var title = "";
        issues.forEach(function (issue) {
            if (issue.pull_request) {
                title += "\n[" + Markdown_1.link('PR ' + issue.number, issue.pull_request.html_url) + "] " + issue.title + "\n___\n";
            }
            else {
                title += "\n[" + Markdown_1.link('ISSUE ' + issue.number, issue.html_url) + "] " + issue.title + "\n___\n";
            }
            return title;
        });
        return title;
    };
    ChangeLogTemplate.prototype.createMd = function () {
        var _this = this;
        var milestonesMd = this._milestones
            .sort(this.sortByMileStone)
            .map(function (item) {
            return "\n" + Markdown_1.altH1(Markdown_1.link(item.milestone.title, item.milestone.html_url)) + "\n\r\n" + item.milestone.description + "\n\r\n" + _this.getIssueTable(item.issues) + "\n                ";
        });
        var template = '';
        milestonesMd.forEach(function (milestoneMd) { return template += milestoneMd; });
        return template;
    };
    return ChangeLogTemplate;
}());
exports.ChangeLogTemplate = ChangeLogTemplate;
