"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var changelog_1 = require("./changelog/changelog");
var Observable_1 = require("@reactivex/rxjs/dist/cjs/Observable");
var changelogTemplate_1 = require("./changelog/changelogTemplate");
var through = require("through2");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError;
var PLUGIN_NAME = 'gulp-changelog-generator';
exports.prefixStream = function (options) {
    var api = new changelog_1.ChangelogApi(options);
    var _milestones = [];
    var template;
    return Observable_1.Observable.create(function (ob) {
        api.milestones
            .flatMap(function (milestones) { return Observable_1.Observable.from(milestones); })
            .filter(function (_milestone) {
            return _milestone.number !== null;
        })
            .flatMap(function (milestone) {
            return api.getIssuesByMileStone(milestone);
        })
            .subscribe(function (resp) {
            _milestones.push(resp);
        }, function (e) {
            console.error(e);
        }, function () {
            var template = new changelogTemplate_1.ChangeLogTemplate(_milestones);
            var stream = through();
            stream.write(new Buffer(template.createMd()));
            ob.next(stream);
            ob.complete();
        });
    });
};
exports.gulpChangeLogGeneratorPlugin = function (options) {
    if (!options.repoName && !options.repoName) {
        throw new PluginError(PLUGIN_NAME, 'Missing prefix repo information!');
    }
    return through.obj(function (file, enc, cb) {
        return exports.prefixStream(options)
            .toPromise()
            .then(function (template) {
            if (file.isNull()) {
                return cb(null, file);
            }
            if (file.isBuffer()) {
                throw new PluginError(PLUGIN_NAME, 'no Buffer support allowed! please use `gulp.src(\'file\', {buffer: false})`');
            }
            if (file.isStream()) {
                file.contents = template;
            }
            return Promise.resolve(cb(null, file));
        })
            .catch(function (e) {
            throw new PluginError(PLUGIN_NAME, e.message);
        });
    });
};
