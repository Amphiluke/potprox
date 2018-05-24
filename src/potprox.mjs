import LennardJones from "./potentials/lennard-jones.mjs";
import Buckingham from "./potentials/buckingham.mjs";
import Morse from "./potentials/morse.mjs";
import Rydberg from "./potentials/rydberg.mjs";
import Varshni3 from "./potentials/varshni3.mjs";
import utils from "./utils.mjs";

let potprox = Object.create(null);
potprox[LennardJones.type] = LennardJones;
potprox[Buckingham.type] = Buckingham;
potprox[Morse.type] = Morse;
potprox[Rydberg.type] = Rydberg;
potprox[Varshni3.type] = Varshni3;

// Other properties of the potprox object are non-enumerable to avoid mixing them with
// potential classes when using such methods as Object.keys, Object.values etc.

Object.defineProperty(potprox, "utils", {
    configurable: true,
    value: utils
});

export default potprox;