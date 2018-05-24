import test from "ava";
import potprox from "../dist/potprox.js";
import potentialData from "./helpers/potential-data.js";
import utils from "./helpers/utils.js";

test("Check `rSqr` for test potential data", t => {
    Object.values(potprox).forEach(PotentialClass => {
        let data = potentialData.get("ab initio").data;
        let potential = PotentialClass.from(data);
        let rSqr = potprox.utils.rSqr(data, potential);
        t.is(typeof rSqr, "number");
        t.true(rSqr > 0.98 && rSqr <= 1.0);
    });
});

test("`rSqr` is equal to 1 for perfectly fitted data", t => {
    potentialData.forEach((data, type) => {
        if (data.params) {
            let rSqr = potprox.utils.rSqr(data.data, new potprox[type](data.params));
            t.true(utils.equal(rSqr, 1));
        }
    });
});