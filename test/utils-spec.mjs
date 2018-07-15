import test from "ava";
import potprox from "../dist/potprox.mjs";
import potentialData from "./helpers/potential-data.mjs";
import utils from "./helpers/utils.mjs";

test("Check `utils.rSqr` for test potential data", t => {
    let data = potentialData.get("ab initio").data;
    Object.values(potprox).forEach(PotentialClass => {
        let potential = PotentialClass.from(data);
        let rSqr = potprox.utils.rSqr(data, potential);
        t.is(typeof rSqr, "number");
        t.true(rSqr > 0.98 && rSqr <= 1.0);
    });
});

test("`utils.rSqr` is equal to 1 for perfectly fitted data", t => {
    potentialData.forEach((data, type) => {
        if (data.params) {
            let rSqr = potprox.utils.rSqr(data.data, new potprox[type](data.params));
            t.true(utils.equal(rSqr, 1));
        }
    });
});

test("`utils.points` generates expected number of points in the given range", t => {
    Object.values(potprox).forEach(PotentialClass => {
        let potential = new PotentialClass();
        let start = potential.r0 / 3;
        let end = potential.r0 * 1.5;
        let count = 15;
        let step = (end - start) / (count - 1);
        let points = [...potprox.utils.points(potential, {start, end, step})];
        t.is(points.length, count);
        t.is(points[0].r, start);
        t.is(points[points.length - 1].r, end);
        t.true(points.every(point => point.r >= start && point.r <= end));
    });
});

test("`utils.points` generates correct data", t => {
    Object.values(potprox).forEach(PotentialClass => {
        let potential = new PotentialClass();
        let start = potential.r0 * 2;
        let end = potential.r0;
        let count = 5;
        let step = (end - start) / (count - 1);
        let i = 0;
        for (let {r, e, index} of potprox.utils.points(potential, {start, end, step})) {
            t.is(index, i);
            t.is(r, start + step * i);
            t.is(e, potential.at(r));
            i++;
        }
    });
});