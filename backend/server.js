// Importerer nødvendige moduler
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Importerer taskService som indeholder forretningslogik
const taskService = require("./services/taskService");

const app = express();

// Tillader at frontend kan kalde backend fra et andet domæne
app.use(cors());

// Gør det muligt at modtage JSON-data fra frontend
app.use(express.json({ limit: "10mb" })); // vigtig for filupload


// ----------------------------------------------------
// HENT ALLE OPGAVER
// ----------------------------------------------------
app.get("/api/tasks", async (req, res) => {
    try {
        const tasks = await taskService.getTasks();
        res.json(tasks);
    } catch (err) {
        console.error("Fejl ved hentning af opgaver:", err);
        res.status(500).json({ error: "Kunne ikke hente opgaver" });
    }
});


// ----------------------------------------------------
// OPRET NY OPGAVE
// ----------------------------------------------------
app.post("/api/tasks", async (req, res) => {
    try {
        const newTask = await taskService.createTask(req.body);
        res.json(newTask);
    } catch (err) {
        console.error("Fejl ved oprettelse:", err);
        res.status(500).json({ error: "Kunne ikke oprette opgave" });
    }
});


// ----------------------------------------------------
// OPDATER OPGAVE
// ----------------------------------------------------
app.put("/api/tasks/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await taskService.updateTask(id, req.body);
        res.json(updated);
    } catch (err) {
        console.error("Fejl ved opdatering:", err);
        res.status(500).json({ error: "Kunne ikke opdatere opgave" });
    }
});


// ----------------------------------------------------
// SLET OPGAVE
// ----------------------------------------------------
app.delete("/api/tasks/:id", async (req, res) => {
    try {
        await taskService.deleteTask(Number(req.params.id));
        res.json({ success: true });
    } catch (err) {
        console.error("Fejl ved sletning:", err);
        res.status(500).json({ error: "Kunne ikke slette opgave" });
    }
});


// ----------------------------------------------------
// EKSPORTÉR OPGAVER TIL JSON-FIL
// ----------------------------------------------------
app.post("/api/export", async (req, res) => {
    try {
        const exportPath = await taskService.exportJSON();
        res.json({ file: exportPath });
    } catch (err) {
        console.error("Fejl ved eksport:", err);
        res.status(500).json({ error: "Kunne ikke eksportere JSON" });
    }
});


// ----------------------------------------------------
// *** MIDDLERTIDIG ROUTE TIL AT UPLOADE EXCEL TIL DISK ***
// ----------------------------------------------------
app.post("/api/upload-initial-excel", async (req, res) => {
    try {
        const filePath = path.join("/data", "opgaver.xlsx");
        const fileBuffer = req.body.file;

        if (!fileBuffer) {
            return res.status(400).json({ error: "No file provided" });
        }

        fs.writeFileSync(filePath, Buffer.from(fileBuffer, "base64"));

        res.json({ message: "Excel uploaded successfully to /data/opgaver.xlsx" });
    } catch (error) {
        console.error("Fejl i upload:", error);
        res.status(500).json({ error: "Failed to upload initial Excel" });
    }
});


// Starter serveren (Render bruger PORT fra environment)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server kører på port", PORT));
