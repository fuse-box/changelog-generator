'use strict';
import {gulpChangeLogGenerator} from './src/tasks/gulp-changelog-generator';
import {GithubConfig} from './src/utils/github-config';
const gulp = require('gulp');



gulp.task('default', function () {
  gulp.src('test/CHANGELOG.md')
    .pipe(gulpChangeLogGenerator(new GithubConfig()))
    .pipe(gulp.dest('./../dist'));
});
