import test from "node:test";
import assert from "node:assert/strict";
import {Varshni3} from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("`d0` parameter validation", () => {
    assert.throws(() => new Varshni3({d0: ""}), TypeError);
    assert.throws(() => new Varshni3({d0: -1}), RangeError);
    let varshni = new Varshni3({d0: 1});
    assert.throws(() => varshni.d0 = "2", TypeError);
    assert.strictEqual(varshni.d0, 1);
    assert.throws(() => varshni.d0 = 0, RangeError);
    assert.strictEqual(varshni.d0, 1);
});

test("`r0` parameter validation", () => {
    assert.throws(() => new Varshni3({r0: ""}), TypeError);
    assert.throws(() => new Varshni3({r0: -1}), RangeError);
    let varshni = new Varshni3({r0: 1});
    assert.throws(() => varshni.r0 = "2", TypeError);
    assert.strictEqual(varshni.r0, 1);
    assert.throws(() => varshni.r0 = 0, RangeError);
    assert.strictEqual(varshni.r0, 1);
});

test("`b` parameter validation", () => {
    assert.throws(() => new Varshni3({b: ""}), TypeError);
    assert.throws(() => new Varshni3({b: -1}), RangeError);
    let varshni = new Varshni3({b: 2});
    assert.throws(() => varshni.b = "3", TypeError);
    assert.strictEqual(varshni.b, 2);
    assert.throws(() => varshni.b = 0, RangeError);
    assert.strictEqual(varshni.b, 2);
});

test("Test potential data fitting", () => {
    let varshni = Varshni3.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("Varshni3").params;
    assert.ok(utils.equal(varshni.d0, testParams.d0));
    assert.ok(utils.equal(varshni.r0, testParams.r0));
    assert.ok(utils.equal(varshni.b, testParams.b));
});

test("Potential value estimation for the given distance", () => {
    let testParams = potentialData.get("Varshni3").params;
    let varshni = new Varshni3(testParams);
    assert.throws(() => varshni.at("1"), TypeError);
    assert.throws(() => varshni.at(-0.1), RangeError);
    assert.ok(utils.equal(varshni.at(testParams.r0), -testParams.d0));
});
