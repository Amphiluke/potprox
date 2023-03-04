import {Chart, LineController, LineElement, LinearScale, PointElement} from "chart.js";
import {$} from "./dom.js";

Chart.register(LineController, LineElement, LinearScale, PointElement);

let axesConfig = {
    type: "linear",
    grid: {
        color: "#014c1a"
    },
    ticks: {
        color: "#c9b405"
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
        maintainAspectRatio: false,
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
    chartInstance = new Chart($("#graph"), config);
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
