1. Installations
___

```shell
bin: npm i | yarn add changelog-generator
```

Example Gulp

```json
import {gulpChangeLogGeneratorPlugin} from 'gulp-changelog-generator';

gulp.task('default', () => {
  const config: Config = {
    username: 'user',
    password: 'secret',
    repoOwner: 'fuse-box',
    repoName: 'fuse-box'
  };
  gulp
    .src('./test/CHANGELOG.md', {buffer: false})
    .pipe(gulpChangeLogGeneratorPlugin(config))
    .pipe(gulp.dest('dist'));
});
```
