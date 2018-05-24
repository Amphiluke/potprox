import test from "ava";
import potprox from "../../dist/potprox.js";

test("Every potential class has static read-only property `type`", t => {
    Object.values(potprox).forEach(PotentialClass => {
        t.true(typeof PotentialClass.type === "string");
        t.throws(() => PotentialClass.type = "", TypeError);
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