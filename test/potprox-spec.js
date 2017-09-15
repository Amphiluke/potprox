import test from "ava";
import potprox from "../src/potprox.js";

test("Enumerable properties of `potprox` are potential classes", t => {
    t.true(Object.entries(potprox).every(([potentialType, PotentialClass]) =>
        typeof PotentialClass === "function" && potentialType === PotentialClass.type
    ));
});

test("`potprox.utils` is a non-enumerable and read-only property", t => {
    let descriptor = Object.getOwnPropertyDescriptor(potprox, "utils");
    if (!descriptor) {
        t.fail("`potprox` has not the property `utils`");
    }
    t.false(descriptor.enumerable);
    t.false(descriptor.writable);
});