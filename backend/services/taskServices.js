// taskService styrer al logik omkring opgaver:
// - hent
// - opret
// - opdater
// - slet
// - eksportér til JSON

const excelService = require("./excelService");
const Task = require("../models/task");
const fs = require("fs");
const path = require("path");


// ----------------------------------------------------
// Hent alle opgaver som Task-objekter
// ----------------------------------------------------
async function getTasks() {
    const rows = await excelService.readTasks();
    return rows.map(r => new Task(r)); // konverter til OOP objekter
}


// ----------------------------------------------------
// Opret en ny opgave
// ----------------------------------------------------
async function createTask(data) {
    const tasks = await getTasks();

    // Find et nyt ID (højeste + 1)
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

    // Opret ny Task instans
    const newTask = new Task({
        id: newId,
        ...data
    });

    tasks.push(newTask);

    // Skriv tilbage til Excel
    await excelService.writeTasks(tasks);
    return newTask;
}


// ----------------------------------------------------
// Opdater en eksisterende opgave
// ----------------------------------------------------
async function updateTask(id, updatedData) {
    const tasks = await getTasks();

    const task = tasks.find(t => t.id === id);
    if (!task) throw new Error("Opgave ikke fundet");

    // OOP-opdatering
    task.update(updatedData);

    await excelService.writeTasks(tasks);
    return task;
}


// ----------------------------------------------------
// Slet en opgave
// ----------------------------------------------------
async function deleteTask(id) {
    const tasks = await getTasks();
    const filtered = tasks.filter(t => t.id !== id);

    await excelService.writeTasks(filtered);
}


// ----------------------------------------------------
// Eksportér opgaver som JSON-fil
// ----------------------------------------------------
async function exportJSON() {
    const tasks = await getTasks();

    const exportDir = path.join(__dirname, "..", "exports");
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    const filePath = path.join(exportDir, "opgaver.json");

    // OOP task → almindelig JSON
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));

    return "/exports/opgaver.json";
}


module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    exportJSON
};
