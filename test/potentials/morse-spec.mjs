import test from "ava";
import {Morse} from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("`d0` parameter validation", t => {
    t.throws(() => new Morse({d0: ""}), {instanceOf: TypeError});
    t.throws(() => new Morse({d0: -1}), {instanceOf: RangeError});
    let morse = new Morse({d0: 1});
    t.throws(() => morse.d0 = "2", {instanceOf: TypeError});
    t.is(morse.d0, 1);
    t.throws(() => morse.d0 = 0, {instanceOf: RangeError});
    t.is(morse.d0, 1);
});

test("`r0` parameter validation", t => {
    t.throws(() => new Morse({r0: ""}), {instanceOf: TypeError});
    t.throws(() => new Morse({r0: -1}), {instanceOf: RangeError});
    let morse = new Morse({r0: 1});
    t.throws(() => morse.r0 = "2", {instanceOf: TypeError});
    t.is(morse.r0, 1);
    t.throws(() => morse.r0 = 0, {instanceOf: RangeError});
    t.is(morse.r0, 1);
});

test("`a` parameter validation", t => {
    t.throws(() => new Morse({a: ""}), {instanceOf: TypeError});
    t.throws(() => new Morse({a: -1}), {instanceOf: RangeError});
    let morse = new Morse({a: 2});
    t.throws(() => morse.a = "3", {instanceOf: TypeError});
    t.is(morse.a, 2);
    t.throws(() => morse.a = 0, {instanceOf: RangeError});
    t.is(morse.a, 2);
});

test("Test potential data fitting", t => {
    let morse = Morse.from(potentialData.get("ab initio").data);
    let testParams = potentialData.get("Morse").params;
    t.true(utils.equal(morse.d0, testParams.d0));
    t.true(utils.equal(morse.r0, testParams.r0));
    t.true(utils.equal(morse.a, testParams.a));
});

test("Potential value estimation for the given distance", t => {
    let testParams = potentialData.get("Morse").params;
    let morse = new Morse(testParams);
    t.throws(() => morse.at("1"), {instanceOf: TypeError});
    t.throws(() => morse.at(-0.1), {instanceOf: RangeError});
    t.true(utils.equal(morse.at(testParams.r0), -testParams.d0));
});