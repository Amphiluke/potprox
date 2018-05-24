import test from "ava";
import potprox from "../../dist/potprox.js";
import potentialData from "../helpers/potential-data.js";
import utils from "../helpers/utils.js";

test("`d0` parameter validation", t => {
    t.throws(() => new potprox.Morse({d0: ""}), TypeError);
    t.throws(() => new potprox.Morse({d0: -1}), RangeError);
    let morse = new potprox.Morse({d0: 1});
    t.throws(() => morse.d0 = "2", TypeError);
    t.is(morse.d0, 1);
    t.throws(() => morse.d0 = 0, RangeError);
    t.is(morse.d0, 1);
});

test("`r0` parameter validation", t => {
    t.throws(() => new potprox.Morse({r0: ""}), TypeError);
    t.throws(() => new potprox.Morse({r0: -1}), RangeError);
    let morse = new potprox.Morse({r0: 1});
    t.throws(() => morse.r0 = "2", TypeError);
    t.is(morse.r0, 1);
    t.throws(() => morse.r0 = 0, RangeError);
    t.is(morse.r0, 1);
});

test("`a` parameter validation", t => {
    t.throws(() => new potprox.Morse({a: ""}), TypeError);
    t.throws(() => new potprox.Morse({a: -1}), RangeError);
    let morse = new potprox.Morse({a: 2});
    t.throws(() => morse.a = "3", TypeError);
    t.is(morse.a, 2);
    t.throws(() => morse.a = 0, RangeError);
    t.is(morse.a, 2);
});

test("Test potential data fitting", t => {
    let morse = potprox.Morse.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("Morse").params;
    t.true(utils.equal(morse.d0, testParams.d0));
    t.true(utils.equal(morse.r0, testParams.r0));
    t.true(utils.equal(morse.a, testParams.a));
});

test("Potential value estimation for the given distance", t => {
    let testParams = potentialData.get("Morse").params;
    let morse = new potprox.Morse(testParams);
    t.throws(() => morse.at("1"), TypeError);
    t.throws(() => morse.at(-0.1), RangeError);
    t.true(utils.equal(morse.at(testParams.r0), -testParams.d0));
});