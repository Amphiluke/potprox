importScripts("../../dist/potprox.min.js");
importScripts("./datasets.js");

self.addEventListener("message", ({data = {}}) => {
    if (data.type !== "recalc") {
        return;
    }
    let dataset = self.datasets[data.datasetType || "default"];
    let result = {};
    Object.keys(self.potprox).forEach(name => {
        let potential = self.potprox[name].from(dataset, {d0Conv: 0.0001, r0Conv: 0.0001, aConv: 0.0001, bConv: 0.0001});
        result[name] = {
            potential: potential.toJSON(),
            rSqr: potential.rSqr(dataset),
            points: [...potential.points({start: 5, end: 10, step: (10 - 5) / 9})]
        };
    });
    self.postMessage({type: "recalcDone", result});
});