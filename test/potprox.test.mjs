import test from "node:test";
import assert from "node:assert/strict";
import * as potprox from "../dist/potprox.mjs";

test("Enumerable properties of `potprox` are potential classes", () => {
    assert.ok(Object.entries(potprox).every(([potentialType, PotentialClass]) =>
        typeof PotentialClass === "function" && potentialType === PotentialClass.type
    ));
});
