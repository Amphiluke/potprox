import test from "ava";
import potprox from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("`epsilon` parameter validation", t => {
    t.throws(() => new potprox.LennardJones({epsilon: ""}), TypeError);
    t.throws(() => new potprox.LennardJones({epsilon: -1}), RangeError);
    let lennardJones = new potprox.LennardJones({epsilon: 1});
    t.throws(() => lennardJones.epsilon = "2", TypeError);
    t.is(lennardJones.epsilon, 1);
    t.throws(() => lennardJones.epsilon = 0, RangeError);
    t.is(lennardJones.epsilon, 1);
});

test("`sigma` parameter validation", t => {
    t.throws(() => new potprox.LennardJones({sigma: ""}), TypeError);
    t.throws(() => new potprox.LennardJones({sigma: -1}), RangeError);
    let lennardJones = new potprox.LennardJones({sigma: 1});
    t.throws(() => lennardJones.sigma = "2", TypeError);
    t.is(lennardJones.sigma, 1);
    t.throws(() => lennardJones.sigma = 0, RangeError);
    t.is(lennardJones.sigma, 1);
});

test("Test potential data fitting", t => {
    let lennardJones = potprox.LennardJones.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("LennardJones").params;
    t.true(utils.equal(lennardJones.epsilon, testParams.epsilon));
    t.true(utils.equal(lennardJones.sigma, testParams.sigma));
});

test("Potential value estimation for the given distance", t => {
    let testParams = potentialData.get("LennardJones").params;
    let lennardJones = new potprox.LennardJones(testParams);
    t.throws(() => lennardJones.at("1"), TypeError);
    t.throws(() => lennardJones.at(-0.1), RangeError);
    t.true(utils.equal(lennardJones.at(testParams.sigma), 0));
});