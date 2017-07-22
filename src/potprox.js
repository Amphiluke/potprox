let potprox = {
    LennardJones: require("./potentials/lennard-jones.js"),
    Buckingham: require("./potentials/buckingham.js"),
    Morse: require("./potentials/morse.js"),
    Rydberg: require("./potentials/rydberg.js"),
    Varshni3: require("./potentials/varshni3.js")
};

// Other properties of the potprox object are non-enumerable to avoid mixing them with
// potential classes when using such methods as Object.keys, Object.values etc.

Object.defineProperty(potprox, "utils", {
    configurable: true,
    value: require("./utils.js")
});

module.exports = potprox;