import test from "node:test";
import assert from "node:assert/strict";
import {LennardJones} from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("`epsilon` parameter validation", () => {
    assert.throws(() => new LennardJones({epsilon: ""}), TypeError);
    assert.throws(() => new LennardJones({epsilon: -1}), RangeError);
    let lennardJones = new LennardJones({epsilon: 1});
    assert.throws(() => lennardJones.epsilon = "2", TypeError);
    assert.strictEqual(lennardJones.epsilon, 1);
    assert.throws(() => lennardJones.epsilon = 0, RangeError);
    assert.strictEqual(lennardJones.epsilon, 1);
});

test("`sigma` parameter validation", () => {
    assert.throws(() => new LennardJones({sigma: ""}), TypeError);
    assert.throws(() => new LennardJones({sigma: -1}), RangeError);
    let lennardJones = new LennardJones({sigma: 1});
    assert.throws(() => lennardJones.sigma = "2", TypeError);
    assert.strictEqual(lennardJones.sigma, 1);
    assert.throws(() => lennardJones.sigma = 0, RangeError);
    assert.strictEqual(lennardJones.sigma, 1);
});

test("Test potential data fitting", () => {
    let lennardJones = LennardJones.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("LennardJones").params;
    assert.ok(utils.equal(lennardJones.epsilon, testParams.epsilon));
    assert.ok(utils.equal(lennardJones.sigma, testParams.sigma));
});

test("Potential value estimation for the given distance", () => {
    let testParams = potentialData.get("LennardJones").params;
    let lennardJones = new LennardJones(testParams);
    assert.throws(() => lennardJones.at("1"), TypeError);
    assert.throws(() => lennardJones.at(-0.1), RangeError);
    assert.ok(utils.equal(lennardJones.at(testParams.sigma), 0));
});
