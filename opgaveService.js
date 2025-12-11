const { readExcel, writeExcel } = require("./services/excelService");
const { exportToSharedJSON } = require("./services/jsonService");
const Task = require("./services/Task");

const fs = require("fs");
const path = require("path");


// ---------------------------------------
// Hjælpefunktion: skriv eksportfil til /export/opgaver.json
// ---------------------------------------
function writeExportFile(tasks) {
    // Konverter alle opgaver til shared format
    const shared = tasks.map(t => exportToSharedJSON(t));

    // Find sti til export-mappen
    const exportPath = path.join(__dirname, "../export/opgaver.json");

    // Skriv JSON-filen (smukt formatteret)
    fs.writeFileSync(exportPath, JSON.stringify(shared, null, 2), "utf8");
}


// GET alle opgaver
function getAllTasks() {
    return readExcel();
}

// GET én opgave
function getTask(id) {
    const tasks = readExcel();
    return tasks.find(t => t.ID === Number(id));
}

// Hjælpefunktion til ny ID
function getNextID(tasks) {
    if (tasks.length === 0) return 1;
    return Math.max(...tasks.map(t => t.ID)) + 1;
}

// CREATE opgave
function createTask(taskData) {
    const tasks = readExcel();

    const newTask = new Task({
        ...taskData,
        ID: getNextID(tasks)
    });

    tasks.push(newTask);
    writeExcel(tasks);
    writeExportFile(tasks);   // ← NY LINJE

    return newTask;
}

// UPDATE opgave
function updateTask(id, updates) {
    const tasks = readExcel();
    const index = tasks.findIndex(t => t.ID === Number(id));
    if (index === -1) return null;

    const updated = new Task({
        ...tasks[index],
        ...updates,
        ID: tasks[index].ID
    });

    tasks[index] = updated;
    writeExcel(tasks);
    writeExportFile(tasks);   // ← NY LINJE

    return updated;
}

// DELETE opgave
function deleteTask(id) {
    const tasks = readExcel();
    const filtered = tasks.filter(t => t.ID !== Number(id));

    if (filtered.length === tasks.length) return false;

    writeExcel(filtered);
    writeExportFile(filtered);   // ← NY LINJE

    return true;
}

// EXPORT opgave til Team 2/3 format
function exportTask(id) {
    const task = getTask(id);
    if (!task) return null;
    return exportToSharedJSON(task);
}

// EXPORT alle opgaver i shared JSON format
function exportAllTasks() {
    const tasks = readExcel();
    return tasks.map(task => task.toSharedJSON());
}

module.exports = {
    getAllTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    exportTask,
    exportAllTasks
};
