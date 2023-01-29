import test from "node:test";
import assert from "node:assert/strict";
import {Buckingham} from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("`d0` parameter validation", () => {
    assert.throws(() => new Buckingham({d0: ""}), TypeError);
    assert.throws(() => new Buckingham({d0: -1}), RangeError);
    let buckingham = new Buckingham({d0: 1});
    assert.throws(() => buckingham.d0 = "2", TypeError);
    assert.strictEqual(buckingham.d0, 1);
    assert.throws(() => buckingham.d0 = 0, RangeError);
    assert.strictEqual(buckingham.d0, 1);
});

test("`r0` parameter validation", () => {
    assert.throws(() => new Buckingham({r0: ""}), TypeError);
    assert.throws(() => new Buckingham({r0: -1}), RangeError);
    let buckingham = new Buckingham({r0: 1});
    assert.throws(() => buckingham.r0 = "2", TypeError);
    assert.strictEqual(buckingham.r0, 1);
    assert.throws(() => buckingham.r0 = 0, RangeError);
    assert.strictEqual(buckingham.r0, 1);
});

test("`a` parameter validation", () => {
    assert.throws(() => new Buckingham({a: ""}), TypeError);
    assert.throws(() => new Buckingham({a: -1}), RangeError);
    let buckingham = new Buckingham({a: 2});
    assert.throws(() => buckingham.a = "3", TypeError);
    assert.strictEqual(buckingham.a, 2);
    assert.throws(() => buckingham.a = 0, RangeError);
    assert.strictEqual(buckingham.a, 2);
});

test("Test potential data fitting", () => {
    let buckingham = Buckingham.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("Buckingham").params;
    assert.ok(utils.equal(buckingham.d0, testParams.d0));
    assert.ok(utils.equal(buckingham.r0, testParams.r0));
    assert.ok(utils.equal(buckingham.a, testParams.a));
});

test("Potential value estimation for the given distance", () => {
    let testParams = potentialData.get("Buckingham").params;
    let buckingham = new Buckingham(testParams);
    assert.throws(() => buckingham.at("1"), TypeError);
    assert.throws(() => buckingham.at(-0.1), RangeError);
    assert.ok(utils.equal(buckingham.at(testParams.r0), -testParams.d0));
});
