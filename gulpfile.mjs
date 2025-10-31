import gulp from "gulp"
import less from "gulp-less"

/* ----------------------------------------- */
/*  Compile LESS
/* ----------------------------------------- */
const LESS_SRC = "./styles/co.less"
const CSS_DEST = "./css"
const LESS_WATCH = ["./styles/**/*.less"]

/**
 *
 */
function compileLESS() {
  console.log("Compiling LESS files from:", LESS_SRC, "to:", CSS_DEST)
  return gulp
    .src(LESS_SRC)
    .pipe(
      less().on("error", function (err) {
        console.error("LESS Error:", err.message)
        this.emit("end")
      }),
    )
    .pipe(gulp.dest(CSS_DEST))
}
const css = gulp.series(compileLESS)

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */
/**
 *
 */
function watchUpdates() {
  gulp.watch(LESS_WATCH, css)
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

export { css }
export default gulp.series(gulp.parallel(css), watchUpdates)
