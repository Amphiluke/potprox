import * as potprox from "potprox";
import {parseCSV, approximate, makeCurveData, winbondToCSV} from "./data-ctrl.js";
import {ChartCtrl} from "./chart-ctrl.js";
import {readFile} from "./utils.js";

let ui = new Map([...document.body.querySelectorAll("[id]")].map(el => [`#${el.id}`, el]));

let chart = new ChartCtrl({ctx: ui.get("#graph").getContext("2d")});

function updateChart(potential) {
    let userData = parseCSV(ui.get("#data").value);
    let potentialType = ui.get("#potential").value;
    if (!potential) {
        potential = approximate(userData, potentialType);
    }
    let rList = userData.map(({x}) => x);
    let potentialData = makeCurveData(potential, Math.min(...rList), Math.max(...rList));
    updateParamSlots(potential);
    chart.update({userData, potentialData});
}

function updateParamSlots(potential) {
    let data = potential ? Object.assign({rSqr: potential._rSqr}, potential.toJSON()) : {};
    let selector = data.type ? `[data-potential="${data.type}"]` : "[data-potential]";
    let paramSlots = ui.get("#ctrl-form").querySelectorAll(`.result${selector} input[name]`);
    [...paramSlots].forEach(slot => slot.value = data[slot.name] || "");
}

function addEventListener(elRef, event, listener) {
    let el = (typeof elRef === "string") ? ui.get(elRef) : elRef;
    el.addEventListener(event, listener, false);
}

function addEventListeners() {
    addEventListener("#file-tab-ctrl", "click", clickTabCtrlHandler);
    addEventListener("#file-csv", "change", fileCSVChangeHandler);
    addEventListener(ui.get("#file-tab-ctrl").querySelector(".tab-sheet[data-format='winbond']"),
        "change", fileWinbondChangeHandler);
    addEventListener("#data", "input", dataInputHandler);
    addEventListener("#data", "change", dataChangeHandler);
    addEventListener("#potential", "change", potentialChangeHandler);
    addEventListener("#ctrl-form", "submit", submitHandler);
    addEventListener("#result-group", "change", paramChangeHandler);
}

function clickTabCtrlHandler({target}) {
    if (!target.classList.contains("tab") || target.classList.contains("tab-active")) {
        return;
    }
    [...ui.get("#file-tab-ctrl").querySelectorAll(".tab")]
        .forEach(el => el.classList.toggle("tab-active", el === target));
    let format = target.dataset.format;
    [...ui.get("#file-tab-ctrl").querySelectorAll(".tab-sheet")]
        .forEach(el => el.classList.toggle("hidden", el.dataset.format !== format));
}

function fileCSVChangeHandler({target}) {
    let file = target.files[0];
    if (!file) {
        return;
    }
    readFile(file)
        .then(csv => ui.get("#data").value = csv)
        .catch(error => console.error(error));
    updateParamSlots(null);
}

function fileWinbondChangeHandler() {
    let kulFile = ui.get("#file-kul").files[0];
    let sum1File = ui.get("#file-sum1").files[0];
    let sum2File = ui.get("#file-sum2").files[0];
    if (!kulFile || !sum1File || !sum2File) {
        return;
    }
    Promise.all([readFile(kulFile), readFile(sum1File), readFile(sum2File)])
        .then(([kul, sum1, sum2]) => ui.get("#data").value = winbondToCSV(kul, sum1, sum2))
        .catch(error => console.error(error));
    updateParamSlots(null);
}

function dataInputHandler({target}) {
    let value = target.value.trim();
    // Automatically convert TSV to CSV
    if (value.includes("\t")) {
        let replacement = value.includes(",") ? ";" : ","; // don’t mix with decimal separator
        target.value = value.replace(/\t/g, replacement);
    }
}

function dataChangeHandler() {
    updateParamSlots(null);
}

function potentialChangeHandler({target}) {
    let type = target.value;
    let dependents = ui.get("#ctrl-form").querySelectorAll("[data-potential]");
    [...dependents].forEach(el => el.classList.toggle("hidden", el.getAttribute("data-potential") !== type));
    updateParamSlots(null);
}

function submitHandler(e) {
    e.preventDefault();
    updateChart();
    ui.get("#result-group").classList.remove("user-modified");
}

function paramChangeHandler() {
    let resultGroup = ui.get("#result-group");
    resultGroup.classList.add("user-modified");
    let type = ui.get("#potential").value;
    let fields = [...resultGroup.querySelectorAll(`.result[data-potential="${type}"] input[name]:not([readonly])`)];
    if (fields.some(({value}) => !value.trim())) {
        return;
    }
    let parameters = Object.fromEntries(fields.map(({name, value}) => [name, Number(value)]));
    let potential = new potprox[type](parameters);
    updateChart(potential);
}

addEventListeners();
updateChart();
