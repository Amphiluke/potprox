import {terser} from "rollup-plugin-terser";
import pkg from "./package.json";

function getConfig(useMinify = false) {
    let config = {
        input: "src/potprox.mjs",
        output: {
            file: `dist/potprox${useMinify ? ".min.js" : ".js"}`,
            format: "umd",
            name: "potprox",
            banner: `/*!\n${pkg.name} v${pkg.version}\n${pkg.homepage}\n*/`
        }
    };
    if (useMinify) {
        config.plugins = [
            terser({
                output: {comments: /^!/}
            })
        ];
    }
    return config;
}

export default [getConfig(), getConfig(true)];