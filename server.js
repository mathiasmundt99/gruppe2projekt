// server.js
// Simpel Express-server der både:
// - server frontend-filer fra /public
// - eksponerer API-endpoints til opgaver

const express = require("express");
const cors = require("cors");
const path = require("path");           // <- KUN én gang her!
const taskService = require("./services/taskService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend-filer fra /public-mappen
app.use(express.static(path.join(__dirname, "public")));


// ----------------------------------------------------
// API: Hent alle opgaver
// ----------------------------------------------------
app.get("/api/tasks", (req, res) => {
    try {
        const tasks = taskService.getTasks();
        res.json(tasks);
    } catch (err) {
        console.error("Fejl ved hentning af opgaver:", err);
        res.status(500).json({ error: "Kunne ikke hente opgaver" });
    }
});


// ----------------------------------------------------
// API: Opret ny opgave
// ----------------------------------------------------
app.post("/api/tasks", (req, res) => {
    try {
        const created = taskService.createTask(req.body);
        res.json(created);
    } catch (err) {
        console.error("Fejl ved oprettelse:", err);
        res.status(500).json({ error: "Kunne ikke oprette opgave" });
    }
});


// ----------------------------------------------------
// API: Opdater opgave
// ----------------------------------------------------
app.put("/api/tasks/:id", (req, res) => {
    try {
        const updated = taskService.updateTask(req.params.id, req.body);
        res.json(updated);
    } catch (err) {
        console.error("Fejl ved opdatering:", err);
        res.status(500).json({ error: "Kunne ikke opdatere opgave" });
    }
});


// ----------------------------------------------------
// API: Slet opgave
// ----------------------------------------------------
app.delete("/api/tasks/:id", (req, res) => {
    try {
        taskService.deleteTask(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error("Fejl ved sletning:", err);
        res.status(500).json({ error: "Kunne ikke slette opgave" });
    }
});


// ----------------------------------------------------
// API: Eksportér alle opgaver som JSON (til Team 2 & 3)
// ----------------------------------------------------
app.get("/api/export", (req, res) => {
    try {
        const tasks = taskService.exportJSON();
        res.json(tasks);
    } catch (err) {
        console.error("Fejl ved eksport:", err);
        res.status(500).json({ error: "Kunne ikke eksportere JSON" });
    }
});


// Start serveren
const PORT = process.env.PORT || 3000;
const fs = require("fs");

app.post("/api/upload-excel", (req, res) => {
    try {
        if (!req.body.file) {
            return res.status(400).json({ error: "No file data received" });
        }

        // Hvor Excel-filen skal ligge
        const excelPath = process.env.EXCEL_PATH || "/data/opgaver.xlsx";

        // Konverter base64 → buffer
        const fileBuffer = Buffer.from(req.body.file, "base64");

        // Skriv fil
        fs.writeFileSync(excelPath, fileBuffer);

        return res.json({ message: "Excel uploaded successfully!" });

    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Excel upload failed" });
    }
});
app.listen(PORT, () => {
    console.log("Server kører på port", PORT);
});
