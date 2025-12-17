// ------------------------------------------------------
// Excel Service
// Håndterer læsning og skrivning af opgaver til og fra en Excel-fil
// ------------------------------------------------------


// Importerer xlsx-biblioteket, som bruges til at læse og skrive Excel-filer
const xlsx = require("xlsx");
// Importerer path for at kunne arbejde sikkert med filstier på tværs af styresystemer
const path = require("path");
// Importerer Task-klassen, som bruges til at strukturere hver opgave
const Task = require("./Task");


// Definerer stien til Excel-filen med opgaver
// __dirname er mappen hvor excelService.js ligger
const filePath = path.join(__dirname, "../data/opgaver.xlsx");
if (!filePath) {
    console.error("Excel-filen findes ikke:", filePath)
}

function readExcel() {
    try {
        // Læser Excel-filen og opretter et workbook-objekt
        const workbook = xlsx.readFile(filePath);
        // Henter det første ark i Excel-filen
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        // Konverterer Excel-arket til JSON. defval: "" sikrer, at tomme celler ikke bliver undefined
        const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

        // Mapper hver række fra Excel til et Task-objekt
        return rows.map(row => new Task(row));
    } catch (error) {
        console.error("Fejl ved læsning af Excel:", error.message);
        return [];
    }
}

async function writeExcel(tasks) {
    try {
        // Konverterer Task-objekter til almindelige JSON-objekter, som kan skrives til Excel
        const plainTasks = tasks.map(task => ({
            ID: task.ID,
            Title: task.Title,
            Description: task.Description,
            Type: task.Type,
            Location: task.Location,
            Radius: task.Radius,
            // Options gemmes som en streng i Excel. Adskilt med semikolon (fx "Start;Stop;Læs mere")
            Options: Array.isArray(task.Options) ? task.Options.join(";") : task.Options,
            ActivationCondition: task.ActivationCondition,
            Activated: task.Activated,
            Completed: task.Completed,
            Difficulty: task.Difficulty,
            Latitude: task.Latitude,
            Longitude: task.Longitude
        }));

        // Opretter et nyt Excel-workbook
        const workbook = xlsx.utils.book_new();
        // Konverterer JSON til et Excel-ark
        const sheet = xlsx.utils.json_to_sheet(plainTasks);
        // Tilføjer arket til workbooken med navnet "Opgaver"
        xlsx.utils.book_append_sheet(workbook, sheet, "Opgaver");
        // Skriver workbooken til Excel-filen
        xlsx.writeFile(workbook, filePath);
    } catch (error) {
        console.error("Fejl ved skrivning til Excel:", error.message);
    }
}

module.exports = { readExcel, writeExcel };
