import test from "ava";
import {Buckingham} from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("`d0` parameter validation", t => {
    t.throws(() => new Buckingham({d0: ""}), TypeError);
    t.throws(() => new Buckingham({d0: -1}), RangeError);
    let buckingham = new Buckingham({d0: 1});
    t.throws(() => buckingham.d0 = "2", TypeError);
    t.is(buckingham.d0, 1);
    t.throws(() => buckingham.d0 = 0, RangeError);
    t.is(buckingham.d0, 1);
});

test("`r0` parameter validation", t => {
    t.throws(() => new Buckingham({r0: ""}), TypeError);
    t.throws(() => new Buckingham({r0: -1}), RangeError);
    let buckingham = new Buckingham({r0: 1});
    t.throws(() => buckingham.r0 = "2", TypeError);
    t.is(buckingham.r0, 1);
    t.throws(() => buckingham.r0 = 0, RangeError);
    t.is(buckingham.r0, 1);
});

test("`a` parameter validation", t => {
    t.throws(() => new Buckingham({a: ""}), TypeError);
    t.throws(() => new Buckingham({a: -1}), RangeError);
    let buckingham = new Buckingham({a: 2});
    t.throws(() => buckingham.a = "3", TypeError);
    t.is(buckingham.a, 2);
    t.throws(() => buckingham.a = 0, RangeError);
    t.is(buckingham.a, 2);
});

test("Test potential data fitting", t => {
    let buckingham = Buckingham.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("Buckingham").params;
    t.true(utils.equal(buckingham.d0, testParams.d0));
    t.true(utils.equal(buckingham.r0, testParams.r0));
    t.true(utils.equal(buckingham.a, testParams.a));
});

test("Potential value estimation for the given distance", t => {
    let testParams = potentialData.get("Buckingham").params;
    let buckingham = new Buckingham(testParams);
    t.throws(() => buckingham.at("1"), TypeError);
    t.throws(() => buckingham.at(-0.1), RangeError);
    t.true(utils.equal(buckingham.at(testParams.r0), -testParams.d0));
});