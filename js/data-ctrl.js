import * as potprox from "potprox";

export function parseCSV(csv) {
    csv = csv.trim();
    let delimiter = csv.includes(";") ? ";" : ",";
    if (delimiter !== ",") {
        csv = csv.replace(/,/g, "."); // make sure that decimal separator is "."
    }
    return csv.split(/(?:\r?\n)+/).map(line => {
        let [x, y] = line.split(delimiter).map(Number);
        return {x, y};
    });
}

export function winbondToCSV(kul, sum1, sum2) {
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
}

export function toPotprox(data) {
    return data.map(({x, y}) => ({r: x, e: y}));
}

export function approximate(data, potentialType) {
    let potproxData = toPotprox(data);
    let potential = potprox[potentialType].from(potproxData);
    potential._rSqr = potential.rSqr(potproxData);
    return potential;
}

export function makeCurveData(potential, start, end) {
    return [...potential.points({start, end})]
        .map(({r: x, e: y}) => ({x, y}));
}
