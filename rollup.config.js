import {terser} from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";

import {createRequire} from "module";

let require = createRequire(import.meta.url);
let pkg = require("./package.json");

export default [
    {
        input: "js/main.js",
        output: {
            file: "js/main.min.js",
            format: "esm"
        },
        plugins: [
            resolve(),
            terser()
        ]
    },
    {
        input: "sw.src.js",
        output: {
            file: "sw.js",
            format: "esm"
        },
        plugins: [
            replace({
                PACKAGE_VERSION: pkg.version,
                delimiters: ["{{", "}}"]
            }),
            terser()
        ]
    }
];
