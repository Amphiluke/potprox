import pkg from "./package.json" with {type: "json"};
import terser from "@rollup/plugin-terser";

let config = {
    input: "src/potprox.mjs",
    output: {
        name: "potprox",
        banner: `/*!\n${pkg.name} v${pkg.version}\n${pkg.homepage}\n*/`,
    },
    plugins: [
        terser({
            output: {comments: /^!/},
        }),
    ],
};

export default [
    {
        input: config.input,
        output: {file: "dist/potprox.mjs", format: "esm", ...config.output},
    },
    {
        input: config.input,
        output: {file: "dist/potprox.min.mjs", format: "esm", ...config.output},
        plugins: config.plugins,
    },
    {
        input: config.input,
        output: {file: "dist/potprox.js", format: "umd", ...config.output},
    },
    {
        input: config.input,
        output: {file: "dist/potprox.min.js", format: "umd", ...config.output},
        plugins: config.plugins,
    },
    {
        input: config.input,
        output: {file: "dist/potprox.cjs", format: "cjs", ...config.output},
    },
];
