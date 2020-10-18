import * as potprox from "potprox";
import {$} from "./dom.js";
import {parseCSV, approximate, makeCurveData, winbondToCSV} from "./data-ctrl.js";
import {resetChart} from "./chart-ctrl.js";
import {readFile} from "./utils.js";

function applyParams(potential) {
    let userData = parseCSV($("#data").value);
    let potentialType = $("#potential").value;
    if (!potential) {
        potential = approximate(userData, potentialType);
    }
    let rList = userData.map(({x}) => x);
    let potentialData = makeCurveData(potential, Math.min(...rList), Math.max(...rList));
    updateParamSlots(potential);
    resetChart({userData, potentialData});
}

function updateParamSlots(potential) {
    let data = potential ? Object.assign({rSqr: potential._rSqr}, potential.toJSON()) : {};
    let selector = data.type ? `[data-potential="${data.type}"]` : "[data-potential]";
    let paramSlots = $("#ctrl-form").querySelectorAll(`.result${selector} input[name]`);
    [...paramSlots].forEach(slot => slot.value = data[slot.name] || "");
}

function addEventListener(elRef, event, listener) {
    let el = (typeof elRef === "string") ? $(elRef) : elRef;
    el.addEventListener(event, listener, false);
}

function addEventListeners() {
    addEventListener("#file-csv", "change", fileCSVChangeHandler);
    addEventListener($("#file-tab-ctrl").querySelector(".tab-sheet[data-format='winbond']"),
        "change", fileWinbondChangeHandler);
    addEventListener("#data", "input", dataInputHandler);
    addEventListener("#data", "change", dataChangeHandler);
    addEventListener("#potential", "change", potentialChangeHandler);
    addEventListener("#ctrl-form", "submit", submitHandler);
    addEventListener("#result-group", "change", paramChangeHandler);
}

function fileCSVChangeHandler({target}) {
    let file = target.files[0];
    if (!file) {
        return;
    }
    readFile(file)
        .then(csv => $("#data").value = csv)
        .catch(error => console.error(error));
    updateParamSlots(null);
}

function fileWinbondChangeHandler() {
    let kulFile = $("#file-kul").files[0];
    let sum1File = $("#file-sum1").files[0];
    let sum2File = $("#file-sum2").files[0];
    if (!kulFile || !sum1File || !sum2File) {
        return;
    }
    Promise.all([readFile(kulFile), readFile(sum1File), readFile(sum2File)])
        .then(([kul, sum1, sum2]) => $("#data").value = winbondToCSV(kul, sum1, sum2))
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
    let dependents = $("#ctrl-form").querySelectorAll("[data-potential]");
    [...dependents].forEach(el => el.classList.toggle("hidden", el.getAttribute("data-potential") !== type));
    updateParamSlots(null);
}

function submitHandler(e) {
    e.preventDefault();
    applyParams();
    $("#result-group").classList.remove("user-modified");
}

function paramChangeHandler() {
    let resultGroup = $("#result-group");
    resultGroup.classList.add("user-modified");
    let type = $("#potential").value;
    let fields = [...resultGroup.querySelectorAll(`.result[data-potential="${type}"] input[name]:not([readonly])`)];
    if (fields.some(({value}) => !value.trim())) {
        return;
    }
    let parameters = Object.fromEntries(fields.map(({name, value}) => [name, Number(value)]));
    let potential = new potprox[type](parameters);
    applyParams(potential);
}

addEventListeners();
applyParams();
