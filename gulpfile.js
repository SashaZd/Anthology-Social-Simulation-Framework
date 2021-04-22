var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var tsify = require("tsify");
var fancy_log = require("fancy-log");
var paths = {
  pages: ["src/*.html","src/*.css"],
};

var watchedBrowserify = watchify(
  browserify({
    basedir: ".",
    debug: true,
    entries: ["src/main.ts"],
    cache: {},
    packageCache: {},
  }).plugin(tsify)
);

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

function bundle() {
  return watchedBrowserify
    .bundle()
    .on("error", fancy_log)
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("dist"));
}

gulp.task("default", gulp.series(gulp.parallel("copy-html"), bundle));
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", fancy_log);

// var typedoc = require("gulp-typedoc");
// gulp.task("typedoc", function () {
//   return gulp.src(["src/**/*.ts"]).pipe(
//     typedoc({
//       out: "docs/",
//       name: "SocialSim",
//     })
//   );
// });
// 
// var typedoc = require("gulp-typedoc");

// gulp.task("typedoc", function() {
//   return gulp
//     .src(["src/main.ts"])
//     .pipe(typedoc({
//       // TypeScript options (see typescript docs)
//       module: "commonjs",
//       target: "es5",
//       includeDeclarations: true,

//       // Output options (see typedoc docs)
//       out: "./out",
//       // json: "output/to/file.json",

//       // TypeDoc options (see typedoc docs)
//       name: "SocialSim",
//       theme: "minimal",
//       // plugins: ["my", "plugins"],
//       ignoreCompilerErrors: false,
//       version: true,
//     }))
//   ;
// });