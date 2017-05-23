let potprox = {
    LennardJones: require("./potentials/lennard-jones.js"),
    Buckingham: require("./potentials/buckingham.js"),
    Morse: require("./potentials/morse.js"),
    Rydberg: require("./potentials/rydberg.js")
};

module.exports = potprox;