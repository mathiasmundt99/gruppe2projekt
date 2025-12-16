const xlsx = require("xlsx");
const path = require("path");
const Task = require("./Task");

const filePath = path.join(__dirname, "../data/opgaver.xlsx");
if(!filePath){
    console.error("Excel-filen findes ikke:", filePath)
}

function readExcel() {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

        return rows.map(row => new Task(row));
    } catch (error) {
        console.error("Fejl ved læsning af Excel:", error.message);
        return []; 
    }
}

async function writeExcel(tasks) {
    try {
        const plainTasks = tasks.map(task => ({
            ID: task.ID,
            Title: task.Title,
            Description: task.Description,
            Type: task.Type,
            Location: task.Location,
            Radius: task.Radius,
            Options: Array.isArray(task.Options) ? task.Options.join(";") : task.Options,
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
    } catch (error) {
        console.error("Fejl ved skrivning til Excel:", error.message);
    }
}

module.exports = { readExcel, writeExcel };
