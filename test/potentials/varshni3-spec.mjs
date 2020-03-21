import test from "ava";
import {Varshni3} from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("`d0` parameter validation", t => {
    t.throws(() => new Varshni3({d0: ""}), {instanceOf: TypeError});
    t.throws(() => new Varshni3({d0: -1}), {instanceOf: RangeError});
    let varshni = new Varshni3({d0: 1});
    t.throws(() => varshni.d0 = "2", {instanceOf: TypeError});
    t.is(varshni.d0, 1);
    t.throws(() => varshni.d0 = 0, {instanceOf: RangeError});
    t.is(varshni.d0, 1);
});

test("`r0` parameter validation", t => {
    t.throws(() => new Varshni3({r0: ""}), {instanceOf: TypeError});
    t.throws(() => new Varshni3({r0: -1}), {instanceOf: RangeError});
    let varshni = new Varshni3({r0: 1});
    t.throws(() => varshni.r0 = "2", {instanceOf: TypeError});
    t.is(varshni.r0, 1);
    t.throws(() => varshni.r0 = 0, {instanceOf: RangeError});
    t.is(varshni.r0, 1);
});

test("`b` parameter validation", t => {
    t.throws(() => new Varshni3({b: ""}), {instanceOf: TypeError});
    t.throws(() => new Varshni3({b: -1}), {instanceOf: RangeError});
    let varshni = new Varshni3({b: 2});
    t.throws(() => varshni.b = "3", {instanceOf: TypeError});
    t.is(varshni.b, 2);
    t.throws(() => varshni.b = 0, {instanceOf: RangeError});
    t.is(varshni.b, 2);
});

test("Test potential data fitting", t => {
    let varshni = Varshni3.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("Varshni3").params;
    t.true(utils.equal(varshni.d0, testParams.d0));
    t.true(utils.equal(varshni.r0, testParams.r0));
    t.true(utils.equal(varshni.b, testParams.b));
});

test("Potential value estimation for the given distance", t => {
    let testParams = potentialData.get("Varshni3").params;
    let varshni = new Varshni3(testParams);
    t.throws(() => varshni.at("1"), {instanceOf: TypeError});
    t.throws(() => varshni.at(-0.1), {instanceOf: RangeError});
    t.true(utils.equal(varshni.at(testParams.r0), -testParams.d0));
});