import test from "ava";
import potprox from "../../dist/potprox.js";
import potentialData from "../helpers/potential-data.js";
import utils from "../helpers/utils.js";

test("`d0` parameter validation", t => {
    t.throws(() => new potprox.Buckingham({d0: ""}), TypeError);
    t.throws(() => new potprox.Buckingham({d0: -1}), RangeError);
    let buckingham = new potprox.Buckingham({d0: 1});
    t.throws(() => buckingham.d0 = "2", TypeError);
    t.is(buckingham.d0, 1);
    t.throws(() => buckingham.d0 = 0, RangeError);
    t.is(buckingham.d0, 1);
});

test("`r0` parameter validation", t => {
    t.throws(() => new potprox.Buckingham({r0: ""}), TypeError);
    t.throws(() => new potprox.Buckingham({r0: -1}), RangeError);
    let buckingham = new potprox.Buckingham({r0: 1});
    t.throws(() => buckingham.r0 = "2", TypeError);
    t.is(buckingham.r0, 1);
    t.throws(() => buckingham.r0 = 0, RangeError);
    t.is(buckingham.r0, 1);
});

test("`a` parameter validation", t => {
    t.throws(() => new potprox.Buckingham({a: ""}), TypeError);
    t.throws(() => new potprox.Buckingham({a: -1}), RangeError);
    let buckingham = new potprox.Buckingham({a: 2});
    t.throws(() => buckingham.a = "3", TypeError);
    t.is(buckingham.a, 2);
    t.throws(() => buckingham.a = 0, RangeError);
    t.is(buckingham.a, 2);
});

test("Test potential data fitting", t => {
    let buckingham = potprox.Buckingham.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("Buckingham").params;
    t.true(utils.equal(buckingham.d0, testParams.d0));
    t.true(utils.equal(buckingham.r0, testParams.r0));
    t.true(utils.equal(buckingham.a, testParams.a));
});

test("Potential value estimation for the given distance", t => {
    let testParams = potentialData.get("Buckingham").params;
    let buckingham = new potprox.Buckingham(testParams);
    t.throws(() => buckingham.at("1"), TypeError);
    t.throws(() => buckingham.at(-0.1), RangeError);
    t.true(utils.equal(buckingham.at(testParams.r0), -testParams.d0));
});