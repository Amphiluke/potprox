import test from "ava";
import {LennardJones} from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("`epsilon` parameter validation", t => {
    t.throws(() => new LennardJones({epsilon: ""}), {instanceOf: TypeError});
    t.throws(() => new LennardJones({epsilon: -1}), {instanceOf: RangeError});
    let lennardJones = new LennardJones({epsilon: 1});
    t.throws(() => lennardJones.epsilon = "2", {instanceOf: TypeError});
    t.is(lennardJones.epsilon, 1);
    t.throws(() => lennardJones.epsilon = 0, {instanceOf: RangeError});
    t.is(lennardJones.epsilon, 1);
});

test("`sigma` parameter validation", t => {
    t.throws(() => new LennardJones({sigma: ""}), {instanceOf: TypeError});
    t.throws(() => new LennardJones({sigma: -1}), {instanceOf: RangeError});
    let lennardJones = new LennardJones({sigma: 1});
    t.throws(() => lennardJones.sigma = "2", {instanceOf: TypeError});
    t.is(lennardJones.sigma, 1);
    t.throws(() => lennardJones.sigma = 0, {instanceOf: RangeError});
    t.is(lennardJones.sigma, 1);
});

test("Test potential data fitting", t => {
    let lennardJones = LennardJones.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("LennardJones").params;
    t.true(utils.equal(lennardJones.epsilon, testParams.epsilon));
    t.true(utils.equal(lennardJones.sigma, testParams.sigma));
});

test("Potential value estimation for the given distance", t => {
    let testParams = potentialData.get("LennardJones").params;
    let lennardJones = new LennardJones(testParams);
    t.throws(() => lennardJones.at("1"), {instanceOf: TypeError});
    t.throws(() => lennardJones.at(-0.1), {instanceOf: RangeError});
    t.true(utils.equal(lennardJones.at(testParams.sigma), 0));
});