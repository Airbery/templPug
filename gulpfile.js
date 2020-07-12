var gulp = require('gulp'),

	imagemin = require("gulp-imagemin"),
	svgSprite = require('gulp-svg-sprites'),
	spritesmith = require('gulp.spritesmith'),
	svgmin = require('gulp-svgmin'),
	webp = require("imagemin-webp"),
	responsive = require('gulp-responsive'),

	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
    autoprefixer = require("autoprefixer"),
	gcmq = require('gulp-group-css-media-queries'),
	sourcemaps = require('gulp-sourcemaps'),
	cleanCSS = require('gulp-clean-css'),

	inlinesource = require("gulp-inline-source"), //Inline <script>,<link><img> html < inline
	fileinclude = require('gulp-file-include'), // @@include('./var.html')
	rev = require('gulp-rev-append'),
	htmlmin = require('gulp-htmlmin'),
	pug = require('gulp-pug'),

	uglify = require('gulp-uglify'),

	browserSync = require("browser-sync").create(),
	args = require('yargs').argv,
	gulpif = require('gulp-if'),
	rename = require("gulp-rename"),
	plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    newer = require('gulp-newer'),
    cache = require("gulp-cache"), //для минификации изображений
    del = require("del"),
    replace = require("gulp-replace"),

    stylelint = require("gulp-stylelint"),
    eslint = require("gulp-eslint"),

    pageres = require('pageres')
    PNG = require('pngjs').PNG,
	pixelmatch = require('pixelmatch'),
	critical = require('critical').stream,
	uncss = require("uncss"),
	fs = require('fs')
;

var basedir = ''; // '' - current dir 
if(args.d) { basedir += args.d + '/'; }
if(args.dir) { basedir = args.dir + "/"; }
if(args.dirt) { basedir = 'atest.home/' + args.dirt + '/'; }
if(args.dirf) { basedir = 'afunction.home/html/' + args.dirf + '/'; }
var build = (args.build)?args.build:false;

// basedir = ''; //'aworks.home/'

const pathServer = basedir + 'build';//"."
const pathAssets = basedir + 'assets/';
const pathBuild = basedir + 'build/';
const paths = {
	html: {
		src: pathAssets + '*.html',
		dist: pathBuild
	},
	styles: {
		main: pathAssets + 'sass/style.scss',
		src: pathAssets + 'sass/**/*.scss',
		dist: pathBuild + 'css'
	},
	pug: {
		src: pathAssets + 'pug/*.pug',
		dist: pathBuild
	},	
	scripts: {
		src: pathAssets + 'js/**/*.js',
		dist: pathBuild + 'js'
	},
	imgs: {
		src: pathAssets + 'img/**/*.+(png|jpg|jpeg|svg)',
		webps: pathBuild + 'img/webp',
		resp: pathAssets + 'img/bg-*.{png,jpg}',
		sprites: pathAssets + 'sprite/*.+(png|jpg|jpeg)',
		psd: pathAssets + '*-assets/*.{png,jpg,jpge}',
		distsrc: pathAssets + 'img',
		dist: pathBuild + 'img'
	},
	svgs: {
		src: pathAssets + 'svg/**/*.svg',
		dist: pathAssets + 'svgmin',
	},
	svgsprites: {
		src: pathAssets + 'svgmin/*.svg',
		dist: pathAssets + 'blocks',
	},
	fonts: {
		src: pathAssets + 'fonts/**/*.*',
		dist: pathBuild + 'fonts',
	},
	libs: {
		src: pathAssets + 'libs/**/*.*',
		dist: pathBuild + 'libs',
	},
	favicons: {
		src: pathAssets + 'favicons/**/*.svg',
		dist: pathBuild + 'img/favicons',
	}
}

gulp.task('styles', function() {
	return gulp.src(paths.styles.main)
		.pipe(gulpif(!build, sourcemaps.init()))
		.pipe(plumber({ errorHandler: onError }))
		.pipe(sass({outputStyle: 'expanded'}))
		.pipe(postcss([ autoprefixer({ cascade: false }) ]))
		.pipe(gcmq())
		.pipe(gulpif(!build, sourcemaps.write()))
		.pipe(gulp.dest(paths.styles.dist))

		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(cleanCSS({ level: 2 }))
		.pipe(gulp.dest(paths.styles.dist))
});

gulp.task("imgmin", function() {
	return gulp.src(paths.imgs.src)
	.pipe(cache(imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.mozjpeg({quality: 75, progressive: true}),
		imagemin.optipng({optimizationLevel: 5}),
		imagemin.svgo({
			plugins: [
				{cleanupIDs: false},
				{removeTitle: true},
				{removeEmptyText: true},
				{removeViewBox: true},
				{removeAttrs: { attrs: '(fill|stroke|class)'} }
			]
		})
	],{
		verbose: true
		})
	))
	.pipe(gulp.dest(paths.imgs.dist));
});

gulp.task('sprite', function () {
	var spriteData = gulp.src(paths.imgs.sprites).pipe(spritesmith({
		imgName: 'sprite.png',
		imgPath: '../img/sprite.png',
		cssName: '../sass/_sprite.css',
		algorithm: 'top-down', //left-right, diagonal, alt-diagonal, binary-tree
		// cssTemplate: basedir + 'assets/templates/' + 'sprite-css.template.handlebars',
		// retinaSrcFilter : [ ' images/*@2x.png ' ] ,
		// retinaImgName : ' sprite@2x.png ' ,
	}));
	return spriteData.pipe(gulp.dest(paths.imgs.distsrc));
});

gulp.task('sprite-hover', function(){
  return gulp.src([pathAssets + 'sass/_sprite.css'])
    .pipe(replace('-hover', ':hover'))
    .pipe(gulp.dest(pathAssets + 'sass/'));
});


// !! version gulp-svgmin 1.2.4
//https://github.com/svg/svgo
gulp.task('svgmin', function () {
	return gulp.src(paths.svgs.src)
		.pipe(svgmin({
			js2svg: {
				pretty: true
			},
			plugins: [
				{removeTitle: true},
				{removeViewBox: true},
				{removeStyleElement: true},
				{removeAttrs: { attrs: '(fill|stroke|class|id)'} }
			]
		}))
		.pipe(gulp.dest(paths.svgs.dist));
});

gulp.task('spritesvg', gulp.series('svgmin', function() {
	return gulp.src(paths.svgsprites.src)
		.pipe(svgSprite({
				mode: "symbols",
				preview: false,
				selector: "icon-%f",
				svg: {
					symbols: 'svg_sprite.svg'
				}
			}
		))
		.pipe(gulp.dest(paths.svgsprites.dist));
}));

gulp.task('imgwebp', function () {
	return gulp.src(paths.imgs.src)
		.pipe(imagemin([
			webp({
				quality: 75
			})
	]))
	.pipe(rename(function (path) {
		path.extname = ".webp";
	}))
	.pipe(gulp.dest(paths.imgs.webps));
});

gulp.task('imgresp', function() {
	return gulp.src(paths.imgs.resp)
		.pipe(responsive({
			'**/*': [
				{
					width: 1000,
					rename: { suffix: '-1000px' }
				},
				{
					width: 480,
					rename: { suffix: '-480px' }
				}
			]
		},
		{
			quality: 70,
			progressive: true,
			withMetadata: false
		}
		))
		.pipe(gulp.dest(paths.imgs.dist))
});

gulp.task('html', function() {
	return gulp.src(paths.html.src)
	.pipe(inlinesource({ compress: false }))  // inline
	.pipe(rev())  // rev=@@hash
	.pipe(fileinclude({
		prefix: '@@',
		basepath: '@file'
	}))
	// .pipe(htmlmin({ collapseWhitespace: true }))  // минификация html
	.pipe(gulp.dest(paths.html.dist));
});

gulp.task('pug', function() {
    return gulp.src(paths.pug.src)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(paths.pug.dist));
});

gulp.task('scripts', function() {
	return gulp.src(paths.scripts.src)
	// .pipe(uglify())
	.pipe(gulp.dest(paths.scripts.dist));
});

// -----------WATCHERS
gulp.task('browsersync', function() {
	browserSync.init({
		server: {
			baseDir: pathServer
		},
		notify: false
		// proxy: basedir //php
		// online: false, // Work offline without internet connection
		// tunnel: true, tunnel: 'projectname', // Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('clean', function () {
	return del(pathBuild);
});

gulp.task('movePs', function() {
	return gulp.src(paths.imgs.psd)
		.pipe(newer(paths.imgs.distsrc))
		.pipe(rename({dirname: ''}))
		.pipe(gulp.dest(paths.imgs.distsrc))
});

gulp.task('copyfonts', function () {
	return gulp.src(paths.fonts.src)
	.pipe(newer(paths.fonts.dist))
	.pipe(gulp.dest(paths.fonts.dist))
});
gulp.task('copylibs', function () {
	return gulp.src(paths.libs.src)
	.pipe(newer(paths.libs.dist))
	.pipe(gulp.dest(paths.libs.dist))
});

gulp.task('browsersync', function () {
	browserSync.init({
		server: {
			baseDir: pathServer
		},
		notify: false
		// proxy: basedir //php
		// online: false, // Work offline without internet connection
		// tunnel: true, tunnel: 'projectname', // Demonstration page: http://projectname.localtunnel.me
	});
});

gulp.task('watch', function() {
	console.log(basedir);
	gulp.watch(paths.styles.src, gulp.series('styles'));
	gulp.watch(paths.imgs.src, gulp.series('imgmin', 'imgwebp'));
	// gulp.watch(paths.html.src, gulp.series('html'));
	gulp.watch(paths.pug.src, gulp.series('pug'));
	gulp.watch(paths.scripts.src, gulp.series('scripts'));
	gulp.watch(paths.fonts.src, gulp.series('copyfonts'));
	gulp.watch(paths.libs.src, gulp.series('copylibs'));
	gulp.watch(paths.imgs.psd).on('add', gulp.series('movePs'));

	// gulp.watch(paths.svgs.src, gulp.series('spritesvg'));
	gulp.watch(paths.imgs.sprites, gulp.series('sprite', 'sprite-hover'));

	gulp.watch([
		pathBuild + '*.html',
		pathBuild + '*.php',
		pathBuild + 'js/*.js',
		pathBuild + 'css/*.css',
		pathBuild + 'img/**/*.{jpg,jpeg,png,svg,webp,gif}',
		pathBuild + 'fonts/**/*',
		pathBuild + 'libs/**/*',
	]).on('change', browserSync.reload);
});

gulp.task('default', gulp.series(
		'clean',
		gulp.parallel(['styles', 'pug', 'scripts', 'imgmin', 'copyfonts', 'copylibs']),
		gulp.parallel('browsersync','watch')
		)
	);
gulp.task('build', gulp.series(
		'clean',
		gulp.parallel(['styles', 'pug', 'scripts', 'imgmin', 'copyfonts', 'copylibs']),
		// gulp.parallel('imgresp', 'imgwebp', 'spritesvg')
		)
	);
// \ -----------WATCHERS

// -----------LINTERS
gulp.task('lintsass', function () {
	return gulp.src(paths.styles.src)
		.pipe(stylelint({
			failAfterError: false,
			syntax: "scss",
			//fix: true,
			reporters: [{
				formatter: 'string',
			console: true
			}]
	}));
});

gulp.task('lintjs', function () {
	return gulp.src(paths.scripts.src)
		.pipe(eslint())
		.pipe(eslint.format())
		// .pipe(eslint.failAfterError());
});
// \ -----------LINTERS

// -----------HELPERS
gulp.task('critical', gulp.series(function() {
  return gulp.src('build/*.html')
    .pipe(critical({
      base: 'build/',
      inline: true,
      dest: 'index-critical.html',
      css: [
        'build/css/style.css'
      ]
    }))
    .pipe(gulp.dest('build'));
}));

gulp.task("uncss", function(cb) {
	var files = ["build/index.html"];
	uncss(files, {
			htmlroot: 'build/',
			ignoreSheets : ['fonts.googleapis', 'cdnjs.cloudflare.com'],
			ignore : [/^#js/],
			// stylesheets  : ['libs/slick.min.css', 'css/style.min.css']
		},
		function (error, output) {
			fs.writeFileSync('assets/blocks/clear.css', output);
			console.log('Sucess' + 'assets/blocks/clear.css');
		}
	);
	cb();
});

var onError = function(err) {
    notify.onError({
		title: 'Error in ' + err.plugin,
	})(err);
    this.emit('end');
};
// \ -----------HELPERS