const { readExcel, writeExcel } = require("./services/excelService");
const { exportToSharedJSON } = require("./services/jsonService");
const Task = require("./services/Task");
const fs = require("fs");
const path = require("path");

// GET alle opgaver
function getAllTasks() {
    try {
        return readExcel();
    } catch (error) {
        console.error("Fejl ved hentning af alle tasks:", error);
    }
}

// GET én opgave
function getTask(id) {
    try {
        const tasks = readExcel();
    return tasks.find(t => t.ID === Number(id));
    } catch (error) {
        console.error("Fejl ved hentning én opgave:", error);
    }
}

// Hjælpefunktion til ny ID
function getNextID(tasks) {
    if (tasks.length === 0) return 1;
    return Math.max(...tasks.map(t => t.ID)) + 1;
}

// CREATE opgave
function createTask(taskData) {
    try {
        const tasks = readExcel();
        const newTask = new Task({ ...taskData, ID: getNextID(tasks) });
        tasks.push(newTask);
        writeExcel(tasks);
        writeExportFile();
        return newTask;
    } catch (error) {
        console.error("Fejl ved oprettelse af opgave:", error);
        return null;
    }
}

// UPDATE opgave
function updateTask(id, updates) {
    try {
        const tasks = readExcel();
        const index = tasks.findIndex(t => t.ID === Number(id));
        if (index === -1) return null;

        const updated = new Task({ ...tasks[index], ...updates, ID: tasks[index].ID });
        tasks[index] = updated;
        writeExcel(tasks);
        writeExportFile();
        return updated;
    } catch (error) {
        console.error("Fejl ved opdatering af opgave:", error);
        return null;
    }
}

// DELETE opgave
function deleteTask(id) {
    try{
    const tasks = readExcel();
    const filtered = tasks.filter(t => t.ID !== Number(id));

    if (filtered.length === tasks.length) return false;

    writeExcel(filtered);
    writeExportFile();
    return true;
    } catch (error) {
        console.error("Fejl ved sletning af opgave:", error);
        return null;
    }
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

function writeExportFile() {
    const dirPath = path.join(__dirname, "staticfiles");
    const filePath = path.join(dirPath, "opgaver.json");
    try{
        // Opret mappe hvis den ikke findes
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    // Hent alle tasks i shared format
    const tasks = exportAllTasks();

    // Skriv filen
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf8");

    console.log("Static exportfil opdateret:", filePath);
    } catch(error){
         console.error("Fejl ved skrivning af exportfil:", error);
    }
}

module.exports = {
    getAllTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    exportTask,
    writeExportFile,
    exportAllTasks
};
