import test from "ava";
import potprox from "../../dist/potprox.js";
import potentialData from "../helpers/potential-data.js";
import utils from "../helpers/utils.js";

test("`d0` parameter validation", t => {
    t.throws(() => new potprox.Varshni3({d0: ""}), TypeError);
    t.throws(() => new potprox.Varshni3({d0: -1}), RangeError);
    let varshni = new potprox.Varshni3({d0: 1});
    t.throws(() => varshni.d0 = "2", TypeError);
    t.is(varshni.d0, 1);
    t.throws(() => varshni.d0 = 0, RangeError);
    t.is(varshni.d0, 1);
});

test("`r0` parameter validation", t => {
    t.throws(() => new potprox.Varshni3({r0: ""}), TypeError);
    t.throws(() => new potprox.Varshni3({r0: -1}), RangeError);
    let varshni = new potprox.Varshni3({r0: 1});
    t.throws(() => varshni.r0 = "2", TypeError);
    t.is(varshni.r0, 1);
    t.throws(() => varshni.r0 = 0, RangeError);
    t.is(varshni.r0, 1);
});

test("`b` parameter validation", t => {
    t.throws(() => new potprox.Varshni3({b: ""}), TypeError);
    t.throws(() => new potprox.Varshni3({b: -1}), RangeError);
    let varshni = new potprox.Varshni3({b: 2});
    t.throws(() => varshni.b = "3", TypeError);
    t.is(varshni.b, 2);
    t.throws(() => varshni.b = 0, RangeError);
    t.is(varshni.b, 2);
});

test("Test potential data fitting", t => {
    let varshni = potprox.Varshni3.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("Varshni3").params;
    t.true(utils.equal(varshni.d0, testParams.d0));
    t.true(utils.equal(varshni.r0, testParams.r0));
    t.true(utils.equal(varshni.b, testParams.b));
});

test("Potential value estimation for the given distance", t => {
    let testParams = potentialData.get("Varshni3").params;
    let varshni = new potprox.Varshni3(testParams);
    t.throws(() => varshni.at("1"), TypeError);
    t.throws(() => varshni.at(-0.1), RangeError);
    t.true(utils.equal(varshni.at(testParams.r0), -testParams.d0));
});