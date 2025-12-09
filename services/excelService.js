const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const Task = require("../models/task");

const EXCEL_PATH = path.join("/data", "opgaver.xlsx");

// Skaber tom excel hvis den ikke findes
function ensureExcel() {
    if (!fs.existsSync(EXCEL_PATH)) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(wb, ws, "Opgaver");
        XLSX.writeFile(wb, EXCEL_PATH);
    }
}

function readExcel() {
    ensureExcel();
    const wb = XLSX.readFile(EXCEL_PATH);
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { defval: "" });
}

function writeExcel(tasks) {
    const rows = tasks.map(t => ({
        ID: t.id,
        Title: t.titel,
        Description: t.beskrivelse,
        Type: t.type,
        Location: t.zone,
        Radius: t.radius,
        Latitude: t.latitude,
        Longitude: t.longitude,
        Options: t.options.join(", "),
        ActivationCondition: t.activationCondition,
        Activated: t.activated,
        Completed: t.completed,
        Difficulty: t.difficulty
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Opgaver");
    XLSX.writeFile(wb, EXCEL_PATH);
}

module.exports = {
    readExcel,
    writeExcel
};
