import test from "node:test";
import assert from "node:assert/strict";
import * as potprox from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("Every potential class has static read-only property `type`", () => {
    Object.values(potprox).forEach(PotentialClass => {
        assert.ok(typeof PotentialClass.type === "string");
        assert.throws(() => PotentialClass.type = "", TypeError);
    });
});

test("Every potential class has static method property `from`", () => {
    Object.values(potprox).forEach(PotentialClass => {
        assert.ok(typeof PotentialClass.from === "function");
    });
});

test("Every potential class has method `at`", () => {
    Object.values(potprox).forEach(PotentialClass => {
        assert.ok(typeof PotentialClass.prototype.at === "function");
    });
});

test("Every potential class has method `toJSON`", () => {
    Object.values(potprox).forEach(PotentialClass => {
        assert.ok(typeof PotentialClass.prototype.toJSON === "function");
    });
});

test("Every potential class provides default potential parameters", () => {
    Object.values(potprox).forEach(PotentialClass => {
        assert.doesNotThrow(() => new PotentialClass());
        assert.doesNotThrow(() => new PotentialClass({}));
        let potentialData = new PotentialClass({}).toJSON();
        assert.ok(Object.values(potentialData).every(value => value !== undefined));
    });
});

test("Every potential instance is JSON-serializable", () => {
    Object.values(potprox).forEach(PotentialClass => {
        let potentialInstance = new PotentialClass();
        let json = JSON.stringify(potentialInstance);
        let potentialInstanceCopy = new PotentialClass(JSON.parse(json));
        assert.deepStrictEqual(potentialInstance.toJSON(), potentialInstanceCopy.toJSON());
    });
});

test("Check `rSqr` for test potential data", () => {
    let data = potentialData.get("ab initio").data;
    Object.values(potprox).forEach(PotentialClass => {
        let potential = PotentialClass.from(data);
        let rSqr = potential.rSqr(data, potential);
        assert.strictEqual(typeof rSqr, "number");
        assert.ok(rSqr > 0.98 && rSqr <= 1.0);
    });
});

test("`rSqr` is equal to 1 for perfectly fitted data", () => {
    potentialData.forEach((data, type) => {
        if (data.params) {
            let rSqr = new potprox[type](data.params).rSqr(data.data);
            assert.ok(utils.equal(rSqr, 1));
        }
    });
});

test("`points` generates expected number of points in the given range", () => {
    Object.values(potprox).forEach(PotentialClass => {
        let potential = new PotentialClass();
        let start = potential.r0 / 3;
        let end = potential.r0 * 1.5;
        let count = 15;
        let step = (end - start) / (count - 1);
        let points = [...potential.points({start, end, step})];
        assert.strictEqual(points.length, count);
        assert.strictEqual(points[0].r, start);
        assert.strictEqual(points[points.length - 1].r, end);
        assert.ok(points.every(point => point.r >= start && point.r <= end));
    });
});

test("`points` generates correct data", () => {
    Object.values(potprox).forEach(PotentialClass => {
        let potential = new PotentialClass();
        let start = potential.r0 * 2;
        let end = potential.r0;
        let count = 5;
        let step = (end - start) / (count - 1);
        let i = 0;
        for (let {r, e, index} of potential.points({start, end, step})) {
            assert.strictEqual(index, i);
            assert.strictEqual(r, start + step * i);
            assert.strictEqual(e, potential.at(r));
            i++;
        }
    });
});
