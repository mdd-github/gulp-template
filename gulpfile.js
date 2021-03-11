const {src, dest, watch, parallel, series} = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const cleanCss = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const imagemin = require('gulp-imagemin');
const rimraf = require("rimraf");
const browserSync = require('browser-sync').create();


const APP_DIRNAME = 'app';
const OUT_DIRNAME = 'output';

const AppJS = (file) => `./${APP_DIRNAME}/js/${file}`;
const AppSCSS = (file) => `./${APP_DIRNAME}/scss/${file}`;
const NodeSCSS = (path) => './node_modules/' + path;

const JS_SOURCE = [
    AppJS('main.js')
];

const SCSS_SOURCE = [
    NodeSCSS('normalize.css/normalize.css'),
    AppSCSS('main.scss')
];

const IMG_SOURCE = `./${APP_DIRNAME}/img/*`;
const HTML_SOURCE = `./${APP_DIRNAME}/**/*.html`;
const FONTS_SOURCE = `./${APP_DIRNAME}/fonts/*`;

const JS_BUILD_DEST = `./${OUT_DIRNAME}/js`;
const JS_APP_DEST = `./${APP_DIRNAME}/js`;
const JS_FILENAME = 'main.min.js';

const CSS_BUILD_DEST = `./${OUT_DIRNAME}/css`;
const CSS_APP_DEST = `./${APP_DIRNAME}/css`;
const CSS_FILENAME = 'main.min.css';

const IMG_DEST = `./${OUT_DIRNAME}/img`;
const HTML_DEST = `./${OUT_DIRNAME}`;
const FONTS_DEST = `./${OUT_DIRNAME}/fonts`;

const buildJS = (destination) =>
    src(JS_SOURCE)
        .pipe(concat(JS_FILENAME))
        .pipe(uglify())
        .pipe(dest(destination));

const buildSCSS = (destination) =>
    src(SCSS_SOURCE)
        .pipe(concat(CSS_FILENAME))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gcmq())
        .pipe(cleanCss())
        .pipe(dest(destination));

const minifyImages = () =>
    src(IMG_SOURCE)
        .pipe(imagemin())
        .pipe(dest(IMG_DEST));

const copyHtml = () =>
    src(HTML_SOURCE)
        .pipe(dest(HTML_DEST));

const copyFonts = () =>
    src(FONTS_SOURCE)
        .pipe(dest(FONTS_DEST));

const cleanUp = (next) => {
    rimraf(`./${OUT_DIRNAME}`, next);
}

const cleanUpApp = (next) => {
    rimraf(`./${APP_DIRNAME}/**/*.min.*`, next);
}

const runServer = () => {
    browserSync.init({
        server: {
            baseDir: `./${APP_DIRNAME}`
        }
    });

    watch(`./${APP_DIRNAME}/scss/*.scss`, () => buildSCSS(CSS_APP_DEST));
    watch([
        `./${APP_DIRNAME}/js/*.js`,
        `!./${APP_DIRNAME}/js/*.min.js`
    ], () => buildJS(JS_APP_DEST));

    watch([
        `./${APP_DIRNAME}/js/*.min.js`,
        `./${APP_DIRNAME}/css/*.min.css`,
        `./${APP_DIRNAME}/fonts/*`,
        `./${APP_DIRNAME}/**/*.html`
    ]).on('change', browserSync.reload);
}

exports.clean = series(cleanUp, cleanUpApp);

exports.build = series(
    cleanUp,
    copyHtml,
    copyFonts,
    () => buildSCSS(CSS_BUILD_DEST),
    () => buildJS(JS_BUILD_DEST),
    minifyImages);

exports.start = series(
    cleanUpApp,
    () => buildSCSS(CSS_APP_DEST),
    () => buildJS(JS_APP_DEST),
    runServer);

