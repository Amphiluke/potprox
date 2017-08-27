let potentialClasses = [
    require("./potentials/lennard-jones.js"),
    require("./potentials/buckingham.js"),
    require("./potentials/morse.js"),
    require("./potentials/rydberg.js"),
    require("./potentials/varshni3.js")
];

let potprox = Object.create(null);

potentialClasses.forEach(potentialClass => potprox[potentialClass.type] = potentialClass);

// Other properties of the potprox object are non-enumerable to avoid mixing them with
// potential classes when using such methods as Object.keys, Object.values etc.

Object.defineProperty(potprox, "utils", {
    configurable: true,
    value: require("./utils.js")
});

module.exports = potprox;