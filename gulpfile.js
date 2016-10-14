var gulp = require('gulp'),
		plugins = require('gulp-load-plugins')(),
		bourbon = require('node-bourbon').includePaths,
    neat = require('node-neat').includePaths;

gulp.task('script', function(){
	return gulp.src([
			'src/js/*.js',
    	'src/js/**/*.js'
    	])
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat('hybrid-store-locator.min.js'))
    .pipe(plugins.uglify())
    .on('error', swallowError)
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('sass', function(){
	return gulp.src([
			'src/sass/*.scss',
      'src/sass/**/*.scss'
      ])
	  .pipe(plugins.sourcemaps.init())
	  .pipe(plugins.sass({
	    includePaths: bourbon,
	    includePaths: neat
	  }))
	  .on('error',plugins.util.log.bind(plugins.util, 'Sass Error'))
	  .pipe(plugins.concat('styles.css'))
	  .pipe(plugins.autoprefixer())
	  .pipe(plugins.cleanCss())
	  .pipe(plugins.sourcemaps.write('.'))
	  .pipe(gulp.dest('dist/css/'));
});

gulp.task('default', ['script', 'sass'], function(){
	gulp.watch(['src/js/*.js', 'src/js/**/*.js'], ['script']);
  gulp.watch(['src/sass/*.scss', 'src/sass/**/*.scss'], ['sass']);
});

function swallowError (error) {
    console.log('javascript error', error.toString())
    this.emit('end')
}