(function (global) {
    "use strict";

    let Chart = global.Chart,
        potprox = global.potprox;

    let utils = {
        readFile(file) {
            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                reader.addEventListener("load", () => resolve(reader.result));
                reader.addEventListener("error", () => reject(reader.error));
                reader.readAsText(file);
            });
        }
    };

    let dataCtrl = {
        parseCSV(csv) {
            csv = csv.trim();
            let delimiter = csv.includes(";") ? ";" : ",";
            if (delimiter !== ",") {
                csv = csv.replace(/,/g, "."); // make sure that decimal separator is "."
            }
            let data = [];
            for (let line of csv.split(/(?:\r?\n)+/)) {
                let [x, y] = line.split(delimiter).map(Number);
                data.push({x, y});
            }
            return data;
        },

        winbondToCSV(kul, sum1, sum2) {
            let kulLines = kul.trim().split(/\r?\n/);
            let sum1Lines = sum1.trim().split(/\r?\n/);
            let sum2Lines = sum2.trim().split(/\r?\n/);
            if (kulLines.length !== sum1Lines.length || kulLines.length !== sum2Lines.length) {
                throw new Error("Winbond files contain mismatched or corrupted data");
            }
            let splitRE = /\s+/;
            let csvLines = kulLines.map((kulLine, lineIndex) => {
                let columns = kulLine.trim().split(splitRE);
                let distance = Number(columns[0]);
                let energy = Number(columns[1]);
                columns = sum1Lines[lineIndex].trim().split(splitRE);
                if (Number(columns[0]) !== distance) {
                    throw new Error("Winbond files contain mismatched or corrupted data");
                }
                energy += Number(columns[columns.length - 1]);
                columns = sum2Lines[lineIndex].trim().split(splitRE);
                if (Number(columns[0]) !== distance) {
                    throw new Error("Winbond files contain mismatched or corrupted data");
                }
                energy += Number(columns[columns.length - 1]);
                return `${distance},${energy.toFixed(8)}`; // sum files contain energy output with 8 decimal digits
            });
            return csvLines.join("\n");
        },

        toPotprox(data) {
            return data.map(({x, y}) => ({r: x, e: y}));
        },

        approximate(data, potentialType) {
            let potproxData = this.toPotprox(data);
            let potential = potprox[potentialType].from(potproxData);
            potential.rSqr = potprox.utils.rSqr(potproxData, potential);
            return potential;
        },

        makeCurveData(potential, start, end) {
            return [...potprox.utils.points(potential, {start, end})]
                .map(({r: x, e: y}) => ({x, y}));
        }
    };

    let chartCtrl = {
        config: {
            type: "line",
            data: {
                datasets: [
                    {
                        borderColor: "transparent",
                        fill: false,
                        pointBorderColor: "#f9df08"
                    },
                    {
                        borderColor: "#039c35",
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 0
                    }
                ]
            },
            options: {
                animation: {
                    duration: 0
                },
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        type: "linear",
                        position: "bottom",
                        gridLines: {
                            color: "#014c1a",
                            zeroLineColor: "#014c1a"
                        },
                        ticks: {
                            fontColor: "#c9b405"
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            color: "#014c1a",
                            zeroLineColor: "#014c1a"
                        },
                        ticks: {
                            fontColor: "#c9b405"
                        }
                    }]
                },
                tooltips: {
                    enabled: false
                }
            }
        },

        createChart(ctx, userData, potentialData) {
            this.config.data.datasets[0].data = userData;
            this.config.data.datasets[1].data = potentialData;
            this.chart = new Chart(ctx, this.config);
        },

        update(userData, potentialData) {
            this.chart.data.datasets[0].data = userData;
            this.chart.data.datasets[1].data = potentialData;
            this.chart.update();
        }
    };

    let uiCtrl = {
        ui: new Map([...document.body.querySelectorAll("[id]")].map(el => [`#${el.id}`, el])),

        init() {
            this.addEventListeners();
            this.updateChart();
        },

        updateChart(potential) {
            let ui = this.ui;
            let userData = dataCtrl.parseCSV(ui.get("#data").value);
            let potentialType = ui.get("#potential").value;
            this.potential = potential || dataCtrl.approximate(userData, potentialType);
            let rList = userData.map(({x}) => x);
            let curveData = dataCtrl.makeCurveData(this.potential, Math.min(...rList), Math.max(...rList));
            this.updateParamSlots();
            if (chartCtrl.chart) {
                chartCtrl.update(userData, curveData);
            } else {
                chartCtrl.createChart(ui.get("#graph").getContext("2d"), userData, curveData);
            }
        },

        updateParamSlots() {
            let potential = this.potential;
            let data = potential ? Object.assign({rSqr: potential.rSqr}, potential.toJSON()) : {};
            let selector = data.type ? `[data-potential="${data.type}"]` : "[data-potential]";
            let paramSlots = this.ui.get("#ctrl-form").querySelectorAll(`.result${selector} input[name]`);
            [...paramSlots].forEach(slot => slot.value = data[slot.name] || "");
        },

        addEventListener(elRef, event, method) {
            let el = (typeof elRef === "string") ? this.ui.get(elRef) : elRef;
            let listener = (typeof method === "string") ? this[method].bind(this) : method;
            el.addEventListener(event, listener, false);
        },

        addEventListeners() {
            this.addEventListener("#file-tab-ctrl", "click", "clickTabCtrlHandler");
            this.addEventListener("#file-csv", "change", "fileCSVChangeHandler");
            this.addEventListener(this.ui.get("#file-tab-ctrl").querySelector(".tab-sheet[data-format='winbond']"),
                "change", "fileWinbondChangeHandler");
            this.addEventListener("#data", "input", "dataInputHandler");
            this.addEventListener("#data", "change", "dataChangeHandler");
            this.addEventListener("#potential", "change", "potentialChangeHandler");
            this.addEventListener("#ctrl-form", "submit", "submitHandler");
            this.addEventListener("#result-group", "change", "paramChangeHandler");
        },

        clickTabCtrlHandler({target}) {
            if (!target.classList.contains("tab") || target.classList.contains("tab-active")) {
                return;
            }
            [...this.ui.get("#file-tab-ctrl").querySelectorAll(".tab")]
                .forEach(el => el.classList.toggle("tab-active", el === target));
            let format = target.dataset.format;
            [...this.ui.get("#file-tab-ctrl").querySelectorAll(".tab-sheet")]
                .forEach(el => el.classList.toggle("hidden", el.dataset.format !== format));
        },

        fileCSVChangeHandler({target}) {
            let file = target.files[0];
            if (!file) {
                return;
            }
            utils.readFile(file)
                .then(csv => this.ui.get("#data").value = csv)
                .catch(error => console.error(error));
            this.potential = null;
            this.updateParamSlots();
        },

        fileWinbondChangeHandler() {
            let ui = this.ui;
            let kulFile = ui.get("#file-kul").files[0];
            let sum1File = ui.get("#file-sum1").files[0];
            let sum2File = ui.get("#file-sum2").files[0];
            if (!kulFile || !sum1File || !sum2File) {
                return;
            }
            Promise.all([utils.readFile(kulFile), utils.readFile(sum1File), utils.readFile(sum2File)])
                .then(([kul, sum1, sum2]) => this.ui.get("#data").value = dataCtrl.winbondToCSV(kul, sum1, sum2))
                .catch(error => console.error(error));
            this.potential = null;
            this.updateParamSlots();
        },

        dataInputHandler({target}) {
            let value = target.value.trim();
            // Automatically convert TSV to CSV
            if (value.includes("\t")) {
                let replacement = value.includes(",") ? ";" : ","; // don't mix with decimal separator
                target.value = value.replace(/\t/g, replacement);
            }
        },

        dataChangeHandler() {
            this.potential = null;
            this.updateParamSlots();
        },

        potentialChangeHandler({target}) {
            let type = target.value;
            let dependents = this.ui.get("#ctrl-form").querySelectorAll("[data-potential]");
            [...dependents].forEach(el => el.classList.toggle("hidden", el.getAttribute("data-potential") !== type));
            this.potential = null;
            this.updateParamSlots();
        },

        submitHandler(e) {
            e.preventDefault();
            this.updateChart();
            this.ui.get("#result-group").classList.remove("user-modified");
        },

        paramChangeHandler({target}) {
            if (!this.potential) {
                return;
            }
            let fieldSet = this.ui.get("#result-group");
            fieldSet.classList.add("user-modified");
            let value = Number(target.value);
            if (!value) {
                return;
            }
            this.potential[target.name] = value;
            this.potential.rSqr = undefined;
            this.updateChart(this.potential);
        }
    };

    uiCtrl.init();
})(this);