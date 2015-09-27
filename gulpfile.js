var gulp = require('gulp');
var browserify = require('gulp-browserify2');
var livereload = require('gulp-livereload');

gulp.task('default', function ()
{
  gulp.src('src/index.js')
  .pipe(browserify({
    fileName: 'index.js',
    options: {
      debug: true
    }
  }))
  .pipe(gulp.dest('dist'))
  .pipe(livereload());
});

gulp.task('watch', function ()
{
  livereload.listen();
  gulp.watch('src/**/*.js', ['default']);
});
