import {Chart, LineController, Line, LinearScale, Point} from "chart.js";

Chart.register(LineController, Line, LinearScale, Point);

let axesConfig = {
    type: "linear",
    gridLines: {
        color: "#014c1a"
    },
    ticks: {
        font: {
            color: "#c9b405"
        }
    }
};

let chartConfig = {
    type: "line",
    data: {
        datasets: [
            {
                fill: false,
                pointBorderColor: "#f9df08",
                showLine: false
            },
            {
                borderColor: "#039c35",
                fill: false,
                lineTension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 0
            }
        ]
    },
    options: {
        animation: false,
        legend: {
            display: false
        },
        scales: {
            x: {
                position: "bottom",
                ...axesConfig
            },
            y: {
                position: "left",
                ...axesConfig
            }
        },
        tooltips: {
            enabled: false
        }
    }
};

export class ChartCtrl {
    constructor({ctx, userData = [], potentialData = []}) {
        this.config = JSON.parse(JSON.stringify(chartConfig));
        this.config.data.datasets[0].data = userData;
        this.config.data.datasets[1].data = potentialData;
        this.chart = new Chart(ctx, this.config);
    }

    update({userData, potentialData}) {
        this.chart.data.datasets[0].data = userData;
        this.chart.data.datasets[1].data = potentialData;
        this.chart.update();
    }
}
