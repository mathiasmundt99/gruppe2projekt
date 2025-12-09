// Dette modul håndterer alt arbejde med Excel-filen:
// - hente Excel via HTTP
// - skrive Excel via FTP til One.com
// - konvertere data mellem Excel og JS

const axios = require("axios");
const XLSX = require("xlsx");
const ftp = require("basic-ftp");

// Læses fra Render Environment Variables
const EXCEL_URL = process.env.EXCEL_URL;       // offentlig URL til filen
const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PASS = process.env.FTP_PASS;
const FTP_FILE_PATH = process.env.EXCEL_PATH; // /www/data/opgaver.xlsx


// ----------------------------------------------------
// Henter Excel-filen fra dit domæne
// ----------------------------------------------------
async function readRawRows() {
    const response = await axios.get(EXCEL_URL, {
        responseType: "arraybuffer"
    });

    const workbook = XLSX.read(response.data, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Konverterer Excel sheet → JSON rækker
    return XLSX.utils.sheet_to_json(sheet);
}


// ----------------------------------------------------
// Skriver Excel-filen opdateret tilbage til One.com via FTP
// ----------------------------------------------------
async function writeRawRows(rows) {
    // Konverter JSON → Excel sheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Opgaver");

    // Konverter workbook til buffer (binary .xlsx)
    const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx"
    });

    // FTP upload til One.com
    const client = new ftp.Client();
    await client.access({
        host: FTP_HOST,
        user: FTP_USER,
        password: FTP_PASS,
        secure: false
    });

    await client.uploadFrom(excelBuffer, FTP_FILE_PATH);
    client.close();
}


// ----------------------------------------------------
// ExcelService API – bruges af taskService
// ----------------------------------------------------

// Returnerer rå JSON rækker fra Excel
async function readTasks() {
    return await readRawRows();
}

// Modtager Task-objekter og skriver rows tilbage
async function writeTasks(tasks) {
    // tasks er Task-objekter → vi konverterer dem til Excel-rækker
    const rows = tasks.map(task => task.toExcelRow());
    await writeRawRows(rows);
}

module.exports = {
    readTasks,
    writeTasks
};
