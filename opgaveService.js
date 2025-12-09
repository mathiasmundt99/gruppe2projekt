const { readExcel, writeExcel } = require("./services/excelService");
const { exportToSharedJSON } = require("./services/jsonService");
const Task = require("./services/Task");

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
    return updated;
}

// DELETE opgave
function deleteTask(id) {
    const tasks = readExcel();
    const filtered = tasks.filter(t => t.ID !== Number(id));

    if (filtered.length === tasks.length) return false;

    writeExcel(filtered);
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
