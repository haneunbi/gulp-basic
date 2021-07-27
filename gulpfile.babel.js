import gulp from 'gulp';
import gpug from 'gulp-pug';
const sass = require('gulp-sass')(require('node-sass'));
import autoprefixer from 'gulp-autoprefixer';
import mincss from 'gulp-csso';
import image from 'gulp-image';
import bro from 'gulp-bro';
import babelify from 'babelify';
import del from 'del';
import ws from 'gulp-webserver';
import ghPages from 'gulp-gh-pages';

const routes = {
    pug: {
        watch: 'src/**/*.pug',
        src: 'src/*.pug',
        dest: 'dist',
    },
    scss: {
        watch: 'src/scss/**/*.scss',
        src: 'src/scss/style.scss',
        dest: 'dist/css',
    },
    img: {
        src: 'src/img/*',
        dest: 'dist/img',
    },
    js: {
        watch: 'src/js/**/*.js',
        src: 'src/js/main.js',
        dest: 'dist/js',
    },
};

const clean = () => del(['dist', '.publish']);

const pug = () => gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));

const img = () =>
    gulp
        .src(routes.img.src)
        .pipe(image({pngquant: false}))
        .pipe(gulp.dest(routes.img.dest));

const style = () =>
    gulp
        .src(routes.scss.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(
            autoprefixer({
                browers: ['last 2 versions'],
                cascade: false,
            })
        )
        .pipe(mincss())
        .pipe(gulp.dest(routes.scss.dest));

const js = () =>
    gulp
        .src(routes.js.src)
        .pipe(
            bro({
                transform: [babelify.configure({presets: ['@babel/preset-env']}), ['uglifyify', {global: true}]],
            })
        )
        .pipe(gulp.dest(routes.js.dest));

const webserver = () => gulp.src('dist').pipe(ws({livereload: true, open: true}));

const gh = () => gulp.src('./dist/**/*').pipe(ghPages());

const watch = () => {
    gulp.watch(routes.pug.watch, pug);
    gulp.watch(routes.img.src, img);
    gulp.watch(routes.scss.watch, style);
    gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, style, js]);

const live = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, gh, clean]);
