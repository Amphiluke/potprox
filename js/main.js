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
            let rList = potproxData.map(({r}) => r);
            let rMax = Math.max(...rList);
            let rMin = Math.min(...rList);
            let approxData = [];
            for (let r = rMin, step = (rMax - rMin) / 50; r < rMax; r += step) {
                approxData.push({x: r, y: potential.at(r)});
            }
            approxData.push({x: rMax, y: potential.at(rMax)});
            return {potential, data: approxData};
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

        updateChart() {
            let ui = this.ui;
            let userData = dataCtrl.parseCSV(ui.get("#data").value);
            let potentialType = ui.get("#potential").value;
            let {potential, data} = dataCtrl.approximate(userData, potentialType);
            this.updateParamSlots(potentialType, potential);
            if (chartCtrl.chart) {
                chartCtrl.update(userData, data);
            } else {
                chartCtrl.createChart(ui.get("#graph").getContext("2d"), userData, data);
            }
        },

        updateParamSlots(potentialType, data = {}) {
            let selector = potentialType ? `[data-potential="${potentialType}"]` : "[data-potential]";
            let paramSlots = this.ui.get("#ctrl-form").querySelectorAll(`.result${selector} [data-param]`);
            [...paramSlots].forEach(slot => slot.textContent = data[slot.getAttribute("data-param")] || "N/A");
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
            this.addEventListener("#data", "change", () => this.updateParamSlots());
            this.addEventListener("#potential", "change", "potentialChangeHandler");
            this.addEventListener("#ctrl-form", "submit", "submitHandler");
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
            this.updateParamSlots();
        },

        potentialChangeHandler({target}) {
            let type = target.value;
            let dependents = this.ui.get("#ctrl-form").querySelectorAll("[data-potential]");
            [...dependents].forEach(el => el.classList.toggle("hidden", el.getAttribute("data-potential") !== type));
        },

        submitHandler(e) {
            e.preventDefault();
            this.updateChart();
        }
    };

    uiCtrl.init();
})(this);