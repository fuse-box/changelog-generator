'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var gulp_changelog_generator_1 = require("../gulp-changelog-generator");
var path = require("path");
var fs = require("fs");
var homedir = require("homedir");
var gulp = require('gulp');
var getGitHubToken = function () {
    var f = path.join(homedir(), ".github-token");
    if (fs.existsSync(f)) {
        return fs.readFileSync(f).toString().trim();
    }
};
gulp.task('default', function () {
    var config = {
        token: getGitHubToken(),
        repoOwner: 'fuse-box',
        repoName: 'fuse-box'
    };
    gulp.src('./test/CHANGELOG.md', { buffer: false })
        .pipe(gulp_changelog_generator_1.gulpChangeLogGeneratorPlugin(config))
        .pipe(gulp.dest(''));
});
