import gulpRaw from 'gulp';
import gulpHelp from 'gulp-help';
import plumber from 'gulp-plumber';
import sass from 'gulp-sass';
import header from 'gulp-header';
import fecha from 'fecha';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';

let gulp = gulpHelp(gulpRaw);

var config = {
    sass: {
        from: 'src/sass/app.scss',
        to: 'min',
        watch: 'src/sass/*.scss'
    },
    jsx: {
        from: 'src/jsx/app.jsx',
        to: 'min',
        watch: 'src/jsx/*.jsx'
    }
};

var banner = '/*! Acme PHP | (c) Titouan Galopin | Build ${date} */\n';

gulp.task('sass:dev', () =>
    gulp.src(config.sass.from)
        .pipe(plumber())
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(gulp.dest(config.sass.to))
);

gulp.task('sass:prod', () =>
    gulp.src(config.sass.from)
        .pipe(plumber())
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(header(banner, { date: fecha.format(new Date(), 'YYYYMMDD') }))
        .pipe(gulp.dest(config.sass.to))
);

gulp.task('sass:watch', ['sass:dev'], () =>
    gulp.watch([ config.sass.watch ], ['sass:dev'])
);

gulp.task('jsx:dev', () =>
    gulp.src(config.jsx.from)
        .pipe(plumber())
        .pipe(webpackStream({
            output: {
                libraryType: 'var',
                library: 'App',
                filename: 'app.js'
            },
            module: { loaders: [ { test: /\.jsx?$/, loader: 'babel' } ] }
        }))
        .pipe(gulp.dest(config.jsx.to))
);

gulp.task('jsx:prod', () =>
    gulp.src(config.jsx.from)
        .pipe(plumber())
        .pipe(webpackStream({
            output: {
                libraryType: 'var',
                library: 'App',
                filename: 'app.js'
            },
            module: { loaders: [ { test: /\.jsx?$/, loader: 'babel' } ] },
            plugins: [
                new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': JSON.stringify('production') } }),
                new webpack.optimize.DedupePlugin(),
                new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false }, test: /\.js($|\?)/i })
            ]
        }))
        .pipe(gulp.dest(config.jsx.to))
);

gulp.task('jsx:watch', ['jsx:dev'], () =>
    gulp.watch([ config.jsx.watch ], ['jsx:dev'])
);

gulp.task('prod', ['sass:prod', 'jsx:prod']);
gulp.task('default', ['sass:watch', 'jsx:watch']);
