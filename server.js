const express = require("express");
const cors = require("cors");
const path = require("path");
const taskService = require("./services/taskService");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.get("/api/tasks", (req, res) => res.json(taskService.getTasks()));
app.post("/api/tasks", (req, res) => res.json(taskService.createTask(req.body)));
app.put("/api/tasks/:id", (req, res) => res.json(taskService.updateTask(req.params.id, req.body)));
app.delete("/api/tasks/:id", (req, res) => res.json({ success: taskService.deleteTask(req.params.id) }));
app.get("/api/export", (req, res) => res.json(taskService.exportJSON()));

const PORT = process.env.PORT || 3000;
const fs = require("fs");
const path = require("path");

// MIDLETIDIG UPLOAD ROUTE – slettes efter første upload
app.post("/api/upload-excel", (req, res) => {
    try {
        const filePath = path.join(process.env.EXCEL_PATH);
        const fileBuffer = Buffer.from(req.body.file, "base64");

        fs.writeFileSync(filePath, fileBuffer);
        res.json({ message: "Excel uploaded!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
});
app.listen(PORT, () => console.log("Server running on port", PORT));
