(function () {
    "use strict";

    let switcher = document.getElementById("datasets");
    switcher.innerHTML = Object.keys(window.datasets)
        .map(key => `<label><input type="radio" name="datasetType" value="${key}"> ${key}</label>`)
        .join(" \u2502 ");
    switcher.datasetType[0].checked = true;
    switcher.addEventListener("change", () => {
        window.postMessage({type: "recalc", datasetType: switcher.datasetType.value}, "*");
    });

    window.addEventListener("load", () => {
        window.postMessage({type: "recalc", datasetType: switcher.datasetType.value}, "*");
    });

    window.addEventListener("message", ({data = {}}) => {
        if (data.type !== "recalcDone") {
            return;
        }
        let output = "";
        Object.entries(data.result).forEach(([name, result]) => {
            output += `================== ${name} ==================\n`;
            output += JSON.stringify(result.potential, null, 4);
            output += `\nR² = ${result.rSqr}\n`;
            output += `points: ${JSON.stringify(result.points, null, 4)}\n\n`;
        });
        document.getElementById("result").textContent = output;
    });
})();