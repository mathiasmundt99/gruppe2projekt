// Opgave-klassen
const Task = require("../models/Task");

// Excel read/write helpers
const { readExcel, writeExcel } = require("./excelService");


// ------------------------------------------------------
// HENT ALLE OPGAVER – HER SKER DEN VIGTIGE MAPPING
// ------------------------------------------------------
function getTasks() {
    const rows = readExcel();

    // MAPPER EXCEL-KOLONNER → TASK MODEL
    return rows.map(row =>
        new Task({
            id: row["ID"] || null,
            titel: row["Title"] || "",
            beskrivelse: row["Description"] || "",
            type: row["Type"] || "",
            zone: row["Location"] || "",
            radius: row["Radius"] ? Number(row["Radius"]) : null,
            latitude: row["Latitude"] || null,
            longitude: row["Longitude"] || null,
            options: row["Options"] ? String(row["Options"]).split(",") : [],
            activationCondition: row["ActivationCondition"] || "",
            activated:
                row["Activated"] === true ||
                row["Activated"] === "TRUE" ||
                row["Activated"] === "true",
            completed:
                row["Completed"] === true ||
                row["Completed"] === "TRUE" ||
                row["Completed"] === "true",
            difficulty: row["Difficulty"] || ""
        })
    );
}


// ------------------------------------------------------
// OPRET OPGAVE
// ------------------------------------------------------
function createTask(data) {
    const tasks = getTasks();
    const newTask = new Task(data);
    tasks.push(newTask);
    writeExcel(tasks);
    return newTask;
}


// ------------------------------------------------------
// OPDATER OPGAVE
// ------------------------------------------------------
function updateTask(id, updates) {
    const tasks = getTasks();
    const index = tasks.findIndex(t => String(t.id) === String(id));

    if (index === -1) throw new Error("Task not found");

    Object.assign(tasks[index], updates);
    tasks[index].updatedAt = new Date();
    writeExcel(tasks);

    return tasks[index];
}


// ------------------------------------------------------
// SLET OPGAVE
// ------------------------------------------------------
function deleteTask(id) {
    const tasks = getTasks();
    const filtered = tasks.filter(t => String(t.id) !== String(id));
    writeExcel(filtered);
    return true;
}


// ------------------------------------------------------
// EKSPORTER OPGAVER SOM JSON
// ------------------------------------------------------
function exportJSON() {
    return getTasks();
}


module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    exportJSON
};
