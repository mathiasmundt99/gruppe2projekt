const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

const excelPath = path.join(__dirname, "data", "opgaver.xlsx");
const SHEET_NAME = "Ark1";

/**
 * Læs rækker råt fra Excel
 */
function readRawRows() {
    if (!fs.existsSync(excelPath)) {
        throw new Error("Excel-filen opgaver.xlsx blev ikke fundet i /data");
    }

    const wb = xlsx.readFile(excelPath);
    const ws = wb.Sheets[SHEET_NAME];

    if (!ws) {
        throw new Error(`Arket '${SHEET_NAME}' blev ikke fundet i Excel-filen`);
    }

    return xlsx.utils.sheet_to_json(ws);
}

/**
 * Mapper en Excel-række → internt task-objekt
 */
function mapRowToTask(row) {
    const latitude = row.Latitude ?? null;   // 55.x
    const longitude = row.Longitude ?? null; // 8.x

    let lokation;

    if (latitude && longitude) {
        // Punkt-lokation
        lokation = {
            type: "Point",
            coordinates: [longitude, latitude] // [lon, lat] – korrekt standard
        };
    } else {
        // Navngivet område
        lokation = {
            type: "NamedLocation",
            name: row.Location || null
        };
    }

    return {
        id: Number(row.ID),
        titel: row.Title || "",
        beskrivelse: row.Description || "",
        type: row.Type ? String(row.Type).toLowerCase() : "land",

        radius: row.Radius ?? null,
        zone: row.Location || "",

        lokation,

        options: row.Options ? String(row.Options).split(";") : [],

        activationCondition: row.ActivationCondition || "",
        activated: !!row.Activated,
        completed: !!row.Completed,
        difficulty: row.Difficulty || "",
        duration: row.Duration || "",

        // Internt arbejder vi altid med korrekte GPS-navne
        latitude: latitude,     // Nord/Syd
        longitude: longitude    // Øst/Vest
    };
}

/**
 * Mapper et internt task-objekt → Excel-række
 */
function mapTaskToRow(task) {
    return {
        ID: task.id,
        Title: task.titel,
        Description: task.beskrivelse,
        Type: task.type,

        Location: task.zone || "",
        Radius: task.radius || "",
        Options: (task.options || []).join(";"),

        ActivationCondition: task.activationCondition || "",
        Activated: !!task.activated,
        Completed: !!task.completed,
        Difficulty: task.difficulty || "",
        Duration: task.duration || "",

        // NU 100% korrekt mapping:
        Latitude: task.latitude,    // 55.x
        Longitude: task.longitude   // 8.x
    };
}

/**
 * Læs ALLE tasks fra Excel
 */
function readTasks() {
    const rows = readRawRows();
    return rows.map(mapRowToTask);
}

/**
 * Gem ALLE tasks tilbage i Excel
 */
function saveTasks(tasks) {
    const rows = tasks.map(mapTaskToRow);
    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, SHEET_NAME);
    xlsx.writeFile(wb, excelPath);
}

module.exports = {
    readTasks,
    saveTasks
};
