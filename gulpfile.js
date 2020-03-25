const gulp = require('gulp');
const uglify = require('gulp-uglify');
const pump = require('pump');
const javascriptObfuscator = require('gulp-javascript-obfuscator');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

gulp.task('release', function(cb) {
    pump([
        tsProject.src()
            .pipe(tsProject())
            .js.pipe(gulp.dest("lib")),
        gulp.src('lib/**/*.js'),
        javascriptObfuscator(),
        gulp.dest('lib-obf')
    ], cb);
});
