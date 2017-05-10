(function (global) {
    "use strict";

    let Chart = global.Chart,
        potprox = global.potprox;

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

        toPotprox(data) {
            return data.map(({x, y}) => ({r: x, e: y}));
        },

        approximate(data, potentialType) {
            let potproxData = this.toPotprox(data);
            let potential = potprox[potentialType].from(potproxData);
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
        ui: {
            form: document.getElementById("ctrl-form"),
            file: document.getElementById("file"),
            data: document.getElementById("data"),
            potential: document.getElementById("potential"),
            graph: document.getElementById("graph")
        },

        init() {
            this.addEventListeners();
            this.updateChart();
        },

        updateChart() {
            let userData = dataCtrl.parseCSV(this.ui.data.value);
            let potentialType = this.ui.potential.value;
            let {potential, data} = dataCtrl.approximate(userData, potentialType);
            this.updateParamSlots(potentialType, potential);
            if (chartCtrl.chart) {
                chartCtrl.update(userData, data);
            } else {
                chartCtrl.createChart(this.ui.graph.getContext("2d"), userData, data);
            }
        },

        updateParamSlots(potentialType, data = {}) {
            let selector = potentialType ? `[data-potential="${potentialType}"]` : "[data-potential]";
            let paramSlots = this.ui.form.querySelectorAll(`.result${selector} [data-param]`);
            [...paramSlots].forEach(slot => slot.textContent = data[slot.getAttribute("data-param")] || "N/A");
        },

        addEventListeners() {
            let ui = this.ui;
            ui.file.addEventListener("change", this.fileChangeHandler.bind(this), false);
            ui.data.addEventListener("change", () => this.updateParamSlots(), false);
            ui.potential.addEventListener("change", this.potentialChangeHandler.bind(this), false);
            ui.form.addEventListener("submit", this.submitHandler.bind(this), false);
        },

        fileChangeHandler(e) {
            let file = e.target.files[0];
            if (!file) {
                return;
            }
            let reader = new FileReader();
            reader.addEventListener("load", () => this.ui.data.value = reader.result);
            reader.addEventListener("error", () => console.error(reader.error));
            reader.readAsText(file);
            this.updateParamSlots();
        },

        potentialChangeHandler(e) {
            let type = e.target.value;
            let dependents = this.ui.form.querySelectorAll("[data-potential]");
            [...dependents].forEach(el => el.classList.toggle("hidden", el.getAttribute("data-potential") !== type));
        },

        submitHandler(e) {
            e.preventDefault();
            this.updateChart();
        }
    };

    uiCtrl.init();
})(this);