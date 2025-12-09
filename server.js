const express = require("express");
const path = require("path");
const cors = require("cors");

const excelService = require("./excelService");
const jsonService = require("./jsonService");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // JSON body parsing
app.use(express.static(path.join(__dirname, "public")));
app.use("/exports", express.static(path.join(__dirname, "exports")));

// Helper: efter ændringer → gem i Excel + opdater JSON
function persistAndExport(tasks) {
    excelService.saveTasks(tasks);
    jsonService.exportTasksToJson(tasks);
}

// GET: alle opgaver
app.get("/api/tasks", (req, res) => {
    try {
        const tasks = excelService.readTasks();
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kunne ikke læse opgaver fra Excel" });
    }
});

// POST: opret ny opgave
app.post("/api/tasks", (req, res) => {
    try {
        const tasks = excelService.readTasks();
        const body = req.body;

        const maxId = tasks.reduce((max, t) => (t.id > max ? t.id : max), 0);
        const newTask = {
            id: maxId + 1,
            titel: body.titel || "",
            beskrivelse: body.beskrivelse || "",
            type: body.type || "land",
            radius: body.radius || null,
            zone: body.zone || "",
            lokation: body.lokation || null,
            options: body.options || [],
            activationCondition: body.activationCondition || "",
            activated: !!body.activated,
            completed: !!body.completed,
            difficulty: body.difficulty || "",
            duration: body.duration || "",
            latitude: body.latitude || null,
            longitude: body.longitude || null
        };

        tasks.push(newTask);
        persistAndExport(tasks);

        res.status(201).json(newTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kunne ikke oprette opgave" });
    }
});

// PUT: opdater eksisterende opgave
app.put("/api/tasks/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const tasks = excelService.readTasks();
        const idx = tasks.findIndex((t) => t.id === id);

        if (idx === -1) {
            return res.status(404).json({ error: "Opgave ikke fundet" });
        }

        const existing = tasks[idx];
        const body = req.body;

        const updated = {
            ...existing,
            titel: body.titel ?? existing.titel,
            beskrivelse: body.beskrivelse ?? existing.beskrivelse,
            type: body.type ?? existing.type,
            radius: body.radius ?? existing.radius,
            zone: body.zone ?? existing.zone,
            lokation: body.lokation ?? existing.lokation,
            options: body.options ?? existing.options,
            activationCondition: body.activationCondition ?? existing.activationCondition,
            activated: body.activated ?? existing.activated,
            completed: body.completed ?? existing.completed,
            difficulty: body.difficulty ?? existing.difficulty,
            duration: body.duration ?? existing.duration,
            latitude: body.latitude ?? existing.latitude,
            longitude: body.longitude ?? existing.longitude
        };

        tasks[idx] = updated;
        persistAndExport(tasks);

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kunne ikke opdatere opgave" });
    }
});

// DELETE: slet opgave
app.delete("/api/tasks/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const tasks = excelService.readTasks();
        const idx = tasks.findIndex((t) => t.id === id);

        if (idx === -1) {
            return res.status(404).json({ error: "Opgave ikke fundet" });
        }

        const deleted = tasks.splice(idx, 1)[0];
        persistAndExport(tasks);

        res.json({ message: "Opgave slettet", deleted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kunne ikke slette opgave" });
    }
});

// POST: tving eksport til JSON (fx manuelt fra UI hvis du vil)
app.post("/api/export", (req, res) => {
    try {
        const tasks = excelService.readTasks();
        jsonService.exportTasksToJson(tasks);
        res.json({ message: "Eksporteret til opgaver.json" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kunne ikke eksportere til JSON" });
    }
});

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});
