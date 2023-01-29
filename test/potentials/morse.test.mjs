import test from "node:test";
import assert from "node:assert/strict";
import {Morse} from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("`d0` parameter validation", () => {
    assert.throws(() => new Morse({d0: ""}), TypeError);
    assert.throws(() => new Morse({d0: -1}), RangeError);
    let morse = new Morse({d0: 1});
    assert.throws(() => morse.d0 = "2", TypeError);
    assert.strictEqual(morse.d0, 1);
    assert.throws(() => morse.d0 = 0, RangeError);
    assert.strictEqual(morse.d0, 1);
});

test("`r0` parameter validation", () => {
    assert.throws(() => new Morse({r0: ""}), TypeError);
    assert.throws(() => new Morse({r0: -1}), RangeError);
    let morse = new Morse({r0: 1});
    assert.throws(() => morse.r0 = "2", TypeError);
    assert.strictEqual(morse.r0, 1);
    assert.throws(() => morse.r0 = 0, RangeError);
    assert.strictEqual(morse.r0, 1);
});

test("`a` parameter validation", () => {
    assert.throws(() => new Morse({a: ""}), TypeError);
    assert.throws(() => new Morse({a: -1}), RangeError);
    let morse = new Morse({a: 2});
    assert.throws(() => morse.a = "3", TypeError);
    assert.strictEqual(morse.a, 2);
    assert.throws(() => morse.a = 0, RangeError);
    assert.strictEqual(morse.a, 2);
});

test("Test potential data fitting", () => {
    let morse = Morse.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("Morse").params;
    assert.ok(utils.equal(morse.d0, testParams.d0));
    assert.ok(utils.equal(morse.r0, testParams.r0));
    assert.ok(utils.equal(morse.a, testParams.a));
});

test("Potential value estimation for the given distance", () => {
    let testParams = potentialData.get("Morse").params;
    let morse = new Morse(testParams);
    assert.throws(() => morse.at("1"), TypeError);
    assert.throws(() => morse.at(-0.1), RangeError);
    assert.ok(utils.equal(morse.at(testParams.r0), -testParams.d0));
});
