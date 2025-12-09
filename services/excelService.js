const xlsx = require("xlsx");
const path = require("path");
const Task = require("./Task");

const filePath = path.join(__dirname, "../data/opgaver.xlsx");

function readExcel() {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    // Konverter hver række til en Task
    return rows.map(row => new Task(row));
}

function writeExcel(tasks) {
    // Konverter Task-objekter tilbage til JSON for Excel
    const plainTasks = tasks.map(task => ({
        ID: task.ID,
        Title: task.Title,
        Description: task.Description,
        Type: task.Type,
        Location: task.Location,
        Radius: task.Radius,
        Options: task.Options,
        ActivationCondition: task.ActivationCondition,
        Activated: task.Activated,
        Completed: task.Completed,
        Difficulty: task.Difficulty,
        Latitude: task.Latitude,
        Longitude: task.Longitude
    }));

    const workbook = xlsx.utils.book_new();
    const sheet = xlsx.utils.json_to_sheet(plainTasks);
    xlsx.utils.book_append_sheet(workbook, sheet, "Opgaver");
    xlsx.writeFile(workbook, filePath);
}

module.exports = { readExcel, writeExcel };
