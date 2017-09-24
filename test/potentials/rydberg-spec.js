import test from "ava";
import potprox from "../../src/potprox.js";
import potentialData from "../helpers/potential-data.js";
import utils from "../helpers/utils.js";

test("`d0` parameter validation", t => {
    t.throws(() => new potprox.Rydberg({d0: ""}), TypeError);
    t.throws(() => new potprox.Rydberg({d0: -1}), RangeError);
    let rydberg = new potprox.Rydberg({d0: 1});
    t.throws(() => rydberg.d0 = "2", TypeError);
    t.is(rydberg.d0, 1);
    t.throws(() => rydberg.d0 = 0, RangeError);
    t.is(rydberg.d0, 1);
});

test("`r0` parameter validation", t => {
    t.throws(() => new potprox.Rydberg({r0: ""}), TypeError);
    t.throws(() => new potprox.Rydberg({r0: -1}), RangeError);
    let rydberg = new potprox.Rydberg({r0: 1});
    t.throws(() => rydberg.r0 = "2", TypeError);
    t.is(rydberg.r0, 1);
    t.throws(() => rydberg.r0 = 0, RangeError);
    t.is(rydberg.r0, 1);
});

test("`b` parameter validation", t => {
    t.throws(() => new potprox.Rydberg({b: ""}), TypeError);
    t.throws(() => new potprox.Rydberg({b: -1}), RangeError);
    let rydberg = new potprox.Rydberg({b: 2});
    t.throws(() => rydberg.b = "3", TypeError);
    t.is(rydberg.b, 2);
    t.throws(() => rydberg.b = 0, RangeError);
    t.is(rydberg.b, 2);
});

test("Test potential data fitting", t => {
    let rydberg = potprox.Rydberg.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("Rydberg").params;
    t.true(utils.equal(rydberg.d0, testParams.d0));
    t.true(utils.equal(rydberg.r0, testParams.r0));
    t.true(utils.equal(rydberg.b, testParams.b));
});

test("Potential value estimation for the given distance", t => {
    let testParams = potentialData.get("Rydberg").params;
    let rydberg = new potprox.Rydberg(testParams);
    t.throws(() => rydberg.at("1"), TypeError);
    t.throws(() => rydberg.at(-0.1), RangeError);
    t.true(utils.equal(rydberg.at(testParams.r0), -testParams.d0));
});