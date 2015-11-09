var gulp = require('gulp');
var concat = require('gulp-concat');
var prefix = require('gulp-autoprefixer');

var paths = {
  scripts: ['./src/polyfills/*.js', './src/*.js'],
  styles: ['./src/*.css']
};

gulp.task('scripts', function() {
  gulp.src(paths.scripts)
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('styles', function() {
  gulp.src(paths.styles)
  .pipe(prefix("last 3 version", "> 1%"))
  .pipe(gulp.dest('./dist/'))
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles, ['styles']);
});

gulp.task('default', ["scripts", "styles", "watch"]);