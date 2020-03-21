import test from "ava";
import * as potprox from "../../dist/potprox.mjs";
import potentialData from "../helpers/potential-data.mjs";
import utils from "../helpers/utils.mjs";

test("Every potential class has static read-only property `type`", t => {
    Object.values(potprox).forEach(PotentialClass => {
        t.true(typeof PotentialClass.type === "string");
        t.throws(() => PotentialClass.type = "", {instanceOf: TypeError});
    });
});

test("Every potential class has static method property `from`", t => {
    Object.values(potprox).forEach(PotentialClass => {
        t.true(typeof PotentialClass.from === "function");
    });
});

test("Every potential class has method `at`", t => {
    Object.values(potprox).forEach(PotentialClass => {
        t.true(typeof PotentialClass.prototype.at === "function");
    });
});

test("Every potential class has method `toJSON`", t => {
    Object.values(potprox).forEach(PotentialClass => {
        t.true(typeof PotentialClass.prototype.toJSON === "function");
    });
});

test("Every potential class provides default potential parameters", t => {
    Object.values(potprox).forEach(PotentialClass => {
        t.notThrows(() => new PotentialClass());
        t.notThrows(() => new PotentialClass({}));
        let potentialData = new PotentialClass({}).toJSON();
        t.true(Object.values(potentialData).every(value => value !== undefined));
    });
});

test("Every potential instance is JSON-serializable", t => {
    Object.values(potprox).forEach(PotentialClass => {
        let potentialInstance = new PotentialClass();
        let json = JSON.stringify(potentialInstance);
        let potentialInstanceCopy = new PotentialClass(JSON.parse(json));
        t.deepEqual(potentialInstance.toJSON(), potentialInstanceCopy.toJSON());
    });
});

test("Check `rSqr` for test potential data", t => {
    let data = potentialData.get("ab initio").data;
    Object.values(potprox).forEach(PotentialClass => {
        let potential = PotentialClass.from(data);
        let rSqr = potential.rSqr(data, potential);
        t.is(typeof rSqr, "number");
        t.true(rSqr > 0.98 && rSqr <= 1.0);
    });
});

test("`rSqr` is equal to 1 for perfectly fitted data", t => {
    potentialData.forEach((data, type) => {
        if (data.params) {
            let rSqr = new potprox[type](data.params).rSqr(data.data);
            t.true(utils.equal(rSqr, 1));
        }
    });
});

test("`points` generates expected number of points in the given range", t => {
    Object.values(potprox).forEach(PotentialClass => {
        let potential = new PotentialClass();
        let start = potential.r0 / 3;
        let end = potential.r0 * 1.5;
        let count = 15;
        let step = (end - start) / (count - 1);
        let points = [...potential.points({start, end, step})];
        t.is(points.length, count);
        t.is(points[0].r, start);
        t.is(points[points.length - 1].r, end);
        t.true(points.every(point => point.r >= start && point.r <= end));
    });
});

test("`points` generates correct data", t => {
    Object.values(potprox).forEach(PotentialClass => {
        let potential = new PotentialClass();
        let start = potential.r0 * 2;
        let end = potential.r0;
        let count = 5;
        let step = (end - start) / (count - 1);
        let i = 0;
        for (let {r, e, index} of potential.points({start, end, step})) {
            t.is(index, i);
            t.is(r, start + step * i);
            t.is(e, potential.at(r));
            i++;
        }
    });
});
