'use strict';
import {Config} from '../changelog/interfaces/Config';
import {gulpChangeLogGeneratorPlugin} from '../gulp-changelog-generator';

const gulp = require('gulp');

gulp.task('default', () => {
   const config: Config = {
    username: '',
    password: '',
    repoOwner: 'fuse-box',
    repoName: 'fuse-box'
  };

  gulp.src('./test/CHANGELOG.md', {buffer:  false})
    .pipe(gulpChangeLogGeneratorPlugin(config))
    .pipe(gulp.dest(''));
});
