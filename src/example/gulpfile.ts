'use strict';
import { Config } from '../changelog/interfaces/Config';
import { gulpChangeLogGeneratorPlugin } from '../gulp-changelog-generator';
import * as path from "path";
import * as fs from "fs";
const homedir = require("homedir");

const gulp = require('gulp');

const getGitHubToken = () => {
  const f = path.join(homedir(), ".github-token")
  if (fs.existsSync(f)) {
    return fs.readFileSync(f).toString().trim();
  }
}
gulp.task('default', () => {
  const config: Config = {
    token: getGitHubToken(),
    repoOwner: 'fuse-box',
    repoName: 'fuse-box'
  };

  gulp.src('./test/CHANGELOG.md', { buffer: false })
    .pipe(gulpChangeLogGeneratorPlugin(config))
    .pipe(gulp.dest(''));
});
