import {Chart, LineController, Line, LinearScale, Point} from "chart.js";
import {$} from "./dom.js";

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

let chartInstance;

function createChart({userData = [], potentialData = []}) {
    let config = JSON.parse(JSON.stringify(chartConfig));
    config.data.datasets[0].data = userData;
    config.data.datasets[1].data = potentialData;
    chartInstance = new Chart($("#graph").getContext("2d"), config);
}

export function resetChart({userData, potentialData}) {
    if (chartInstance) {
        chartInstance.data.datasets[0].data = userData;
        chartInstance.data.datasets[1].data = potentialData;
        chartInstance.update();
    } else {
        createChart({userData, potentialData});
    }
}
