let fs = require("fs");
let through2 = require("through2");
let browserify = require("browserify");
let babel = require("babel-core");
let pkg = require("../package.json");

function transform(transpile = false) {
    let contents = "";
    let transformFn = (chunk, enc, cb) => {
        contents += chunk;
        cb();
    };
    let flushFn = (cb) => {
        let code = `// ${pkg.name} v${pkg.version}\n// ${pkg.homepage}\n`;
        if (transpile) {
            // disable the minify-builtins plugin as it generates global variables
            code += babel.transform(contents, {presets: [["babili", {builtIns: false}]]}).code;
        } else {
            code += contents;
        }
        cb(null, code);
    };
    return through2({objectMode: true}, transformFn, flushFn);
}

let bundleStream = browserify("./src/potprox.js", {standalone: "potprox"}).bundle();

bundleStream
    .pipe(transform())
    .pipe(fs.createWriteStream("./dist/potprox.js"));

bundleStream
    .pipe(transform(true))
    .pipe(fs.createWriteStream("./dist/potprox.min.js"));