export default {
    files: ["test/**/*-spec.mjs"],
    sources: ["dist/potprox.mjs"],
    babel: {
        extensions: ["mjs"]
    },
    require: ["esm"],
    verbose: true
};