import "./ui-ctrl.js";

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/potprox/sw.js");
}
