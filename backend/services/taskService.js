const Task = require("../models/task");
const { readExcel, writeExcel } = require("./excelService");

function getTasks() {
    const rows = readExcel();
    return rows.map(r => new Task(r));
}

function createTask(data) {
    const tasks = getTasks();
    const task = new Task(data);
    tasks.push(task);
    writeExcel(tasks);
    return task;
}

function updateTask(id, updates) {
    const tasks = getTasks();
    const index = tasks.findIndex(t => t.id == id);
    if (index === -1) throw new Error("Task not found");

    Object.assign(tasks[index], updates);
    tasks[index].updatedAt = new Date();
    writeExcel(tasks);

    return tasks[index];
}

function deleteTask(id) {
    const tasks = getTasks();
    const filtered = tasks.filter(t => t.id != id);
    writeExcel(filtered);
    return true;
}

function exportJSON() {
    const tasks = getTasks();
    return tasks; // Frontend henter JSON direkte
}

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    exportJSON
};
