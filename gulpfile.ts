/// <reference path="./typings/index.d.ts" />

import * as childProcess from 'child_process';
import * as electron from 'electron-prebuilt';
import * as less from 'gulp-less';
import * as gulp from 'gulp';

gulp.task('default', ['start', 'less'], () => {});

var watcher = gulp.watch('./app/style/**/*.less', ['less']);

gulp.task('start', function() {
  childProcess.spawn(electron, ['./app/index.js'])
    .on('close', function() {
      process.exit()
    });
});

gulp.task('less', function() {
  return gulp.src('./app/style/**/*.less')
    .pipe(less({
      paths: [__dirname + '/app/style']
    }))
    .pipe(gulp.dest('./app/style'));
});
