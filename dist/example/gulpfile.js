'use strict';
var gulp_changelog_generator_1 = require('../gulp-changelog-generator');
var gulp = require('gulp');
gulp.task('default', function () {
    var config = {
        repoOwner: 'fuse-box',
        repoName: 'fuse-box'
    };
    gulp.src('./test/CHANGELOG.md', { buffer: false })
        .pipe(gulp_changelog_generator_1.gulpChangeLogGeneratorPlugin(config))
        .pipe(gulp.dest(''));
});
