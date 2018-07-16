import {terser} from "rollup-plugin-terser";
import pkg from "./package.json";

function getConfig({format = "umd", minify = false} = {}) {
    let config = {
        input: "src/potprox.mjs",
        output: {
            file: `dist/potprox${minify ? ".min" : ""}${format === "es" ? ".mjs" : ".js"}`,
            format,
            name: "potprox",
            banner: `/*!\n${pkg.name} v${pkg.version}\n${pkg.homepage}\n*/`
        }
    };
    if (minify) {
        config.plugins = [
            terser({
                output: {comments: /^!/},
                module: format === "es"
            })
        ];
    }
    return config;
}

export default [
    getConfig(),
    getConfig({minify: true}),
    getConfig({format: "es"}),
    getConfig({format: "es", minify: true})
];