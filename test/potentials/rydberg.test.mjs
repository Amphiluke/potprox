import test from "node:test";
import assert from "node:assert/strict";
import {Rydberg} from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("`d0` parameter validation", () => {
    assert.throws(() => new Rydberg({d0: ""}), TypeError);
    assert.throws(() => new Rydberg({d0: -1}), RangeError);
    let rydberg = new Rydberg({d0: 1});
    assert.throws(() => rydberg.d0 = "2", TypeError);
    assert.strictEqual(rydberg.d0, 1);
    assert.throws(() => rydberg.d0 = 0, RangeError);
    assert.strictEqual(rydberg.d0, 1);
});

test("`r0` parameter validation", () => {
    assert.throws(() => new Rydberg({r0: ""}), TypeError);
    assert.throws(() => new Rydberg({r0: -1}), RangeError);
    let rydberg = new Rydberg({r0: 1});
    assert.throws(() => rydberg.r0 = "2", TypeError);
    assert.strictEqual(rydberg.r0, 1);
    assert.throws(() => rydberg.r0 = 0, RangeError);
    assert.strictEqual(rydberg.r0, 1);
});

test("`b` parameter validation", () => {
    assert.throws(() => new Rydberg({b: ""}), TypeError);
    assert.throws(() => new Rydberg({b: -1}), RangeError);
    let rydberg = new Rydberg({b: 2});
    assert.throws(() => rydberg.b = "3", TypeError);
    assert.strictEqual(rydberg.b, 2);
    assert.throws(() => rydberg.b = 0, RangeError);
    assert.strictEqual(rydberg.b, 2);
});

test("Test potential data fitting", () => {
    let rydberg = Rydberg.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("Rydberg").params;
    assert.ok(utils.equal(rydberg.d0, testParams.d0));
    assert.ok(utils.equal(rydberg.r0, testParams.r0));
    assert.ok(utils.equal(rydberg.b, testParams.b));
});

test("Potential value estimation for the given distance", () => {
    let testParams = potentialData.get("Rydberg").params;
    let rydberg = new Rydberg(testParams);
    assert.throws(() => rydberg.at("1"), TypeError);
    assert.throws(() => rydberg.at(-0.1), RangeError);
    assert.ok(utils.equal(rydberg.at(testParams.r0), -testParams.d0));
});
