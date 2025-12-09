const express = require("express");
const cors = require("cors");
const taskService = require("./services/taskService");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/tasks", (req, res) => {
    res.json(taskService.getTasks());
});

app.post("/api/tasks", (req, res) => {
    try {
        const task = taskService.createTask(req.body);
        res.json(task);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put("/api/tasks/:id", (req, res) => {
    try {
        const updated = taskService.updateTask(req.params.id, req.body);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete("/api/tasks/:id", (req, res) => {
    taskService.deleteTask(req.params.id);
    res.json({ success: true });
});

app.get("/api/export", (req, res) => {
    res.json(taskService.exportJSON());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on port", PORT));
