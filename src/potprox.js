let potprox = {
    LennardJones: require("./potentials/lennard-jones.js"),
    Buckingham: require("./potentials/buckingham.js"),
    Morse: require("./potentials/morse.js"),
    Rydberg: require("./potentials/rydberg.js"),
    Varshni3: require("./potentials/varshni3.js")
};

module.exports = potprox;