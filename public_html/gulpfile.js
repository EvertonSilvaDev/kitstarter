// Variaveis

var gulp = require('gulp'),
sass = require('gulp-sass'),
rename = require('gulp-rename'),
concat     = require('gulp-concat-util'),
livereload = require('gulp-livereload'),
watch = require('gulp-watch'),
filter = require('gulp-filter'),
mainBowerFiles = require('main-bower-files'),
bowerNormalizer = require('gulp-bower-normalize'),
jsValidate = require('gulp-jsvalidate'),
browserify = require('gulp-browserify'),
coffee = require('gulp-coffee'),
imagemin = require('gulp-imagemin'),
include = require('gulp-include');

//json listando o caminho do codigo fonte e o destino de cada linguagem
var src = {
  sass:"src/sass/**/*.scss",
  coffee:"src/coffee/**/*.coffee",
  js:"src/js/**/*.js",
  img:"src/img/**.*",
  app:"/**/*.+(html|php|twig)"
},
dist = {
  css: "dist/css/",
  js: "dist/js/",
  img: "dist/img/"
};

// compilador Sass
gulp.task('compila_sass', function(){
  return gulp.src(src.sass)
  .pipe(sass({outputStyle: 'compressed'}).on('error',sass.logError))
  .pipe(rename('style.min.css'))
  .pipe(gulp.dest(dist.css))
  .pipe(livereload());
});

//image min
gulp.task('image_min',function(){
  return gulp.src(src.img)
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.jpegtran({progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemon.svgo({
      plugins: [
        {removeViewBox: true},
        {cleanupIDs: false}
      ]
    })
  ]))
  .pipe(gulp.dest(dist.img))
});

// Concatenador de arquivos Bower
gulp.task('bower',function(){
    var filterJS = filter('**/*.js')
    var filterCSS = filter('**/*.css')
    return gulp.src(mainBowerFiles(), {base: './bower_components'})
    .pipe(bowerNormalizer({ bowerJson: './bower.json' }))
    .pipe(filterJS)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(dist.js))
    .pipe(filterJS.restore)
    .pipe(filterCSS)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(dist.css))
    .pipe(filterCSS.restore)
    .pipe(rename(function(path){
      if(~path.dirname.indexOf('fonts')){
        path.dirname="/fonts"
      }
    }))
    .pipe(gulp.dest(dist.css))
    .pipe(livereload());
});

//compilador CoffeeScript
gulp.task('compila_coffee',function(){
    return gulp.src(src.coffee)
    .pipe(include())
    .pipe(coffee())
    .pipe(browserify({
      insertGlobals:true,
      extensions:['.coffee'],
      debug: true
    }))
    .pipe(concat('main_coffee.js'))
    .pipe(gulp.dest(dist.js))
    .pipe(livereload());
});

//empacotador js
gulp.task('js',function(){
    return gulp.src(src.js)
    .pipe(jsValidate())
    .pipe(concat('main.js'))
    .pipe(gulp.dest(dist.js))
    .pipe(livereload());
});

//verifica os arquivos modificados

gulp.task('watch', function(){
  livereload.listen();
  gulp.watch(src.sass, ['compila_sass']);
  gulp.watch(src.coffee, ['compila_coffee']);
  gulp.watch(src.bower, ['bower']);
  gulp.watch(src.js, ['js']);
  gulp.watch(src.img, ['image_min']);
  gulp.watch(src.app).on('change',livereload.changed);
});

gulp.task('default', ['compila_sass','compila_coffee','bower','js','image_min','watch']);