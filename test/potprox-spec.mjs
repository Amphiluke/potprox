import test from "ava";
import * as potprox from "../dist/potprox.mjs";

test("Enumerable properties of `potprox` are potential classes", t => {
    t.true(Object.entries(potprox).every(([potentialType, PotentialClass]) =>
        typeof PotentialClass === "function" && potentialType === PotentialClass.type
    ));
});
