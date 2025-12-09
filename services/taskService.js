const Task = require("../models/Task");
const { readExcel, writeExcel } = require("./excelService");

function getTasks() {
    const rows = readExcel();
    return rows.map(row => new Task(row));
}

function createTask(data) {
    const tasks = getTasks();
    const newTask = new Task(data);
    tasks.push(newTask);
    writeExcel(tasks);
    return newTask;
}

function updateTask(id, updates) {
    const tasks = getTasks();
    const index = tasks.findIndex(t => String(t.id) === String(id));
    if (index === -1) throw new Error("Task not found");

    Object.assign(tasks[index], updates);
    tasks[index].updatedAt = new Date();
    writeExcel(tasks);

    return tasks[index];
}

function deleteTask(id) {
    const tasks = getTasks();
    const filtered = tasks.filter(t => String(t.id) !== String(id));
    writeExcel(filtered);
    return true;
}

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
