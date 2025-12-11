// server.js — Node HTTP server uden Express

const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

const {
    getAllTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    exportTask,
    exportAllTasks
} = require("./opgaveService");

// Helper functions
function sendJSON(res, data) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

function notFound(res) {
    res.writeHead(404);
    res.end("Not Found");
}

function setHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer((req, res) => {
    setHeaders(res);

    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname;
    const method = req.method;

    // Handle OPTIONS (CORS preflight)
    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // ------------------------------------------------------
    // SERVE STATIC EXPORT FILES
    // ------------------------------------------------------
    if (method === "GET" && pathName.startsWith("/export/")) {

        // vigtig rettelse: path.resolve så Render finder filen korrekt
        const filePath = path.resolve(__dirname, ".." + pathName);

        if (fs.existsSync(filePath)) {
            const file = fs.readFileSync(filePath);
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(file);
        }

        return notFound(res);
    }

    // -------------------------
    // GET /opgaver
    // -------------------------
    if (method === "GET" && pathName === "/opgaver") {
        return sendJSON(res, getAllTasks());
    }

    // -------------------------
    // GET /opgaver/:id
    // -------------------------
    const taskMatch = pathName.match(/^\/opgaver\/(\d+)$/);
    if (method === "GET" && taskMatch) {
        const id = Number(taskMatch[1]);
        const task = getTask(id);

        return task ? sendJSON(res, task) : notFound(res);
    }

    // -------------------------
    // GET /export     (API format)
    // -------------------------
    if (method === "GET" && pathName === "/export") {
        return sendJSON(res, exportAllTasks());
    }

    // -------------------------
    // GET /export/:id (API format)
    // -------------------------
    const exportMatch = pathName.match(/^\/export\/(\d+)$/);
    if (method === "GET" && exportMatch) {
        const id = Number(exportMatch[1]);
        const data = exportTask(id);

        return data ? sendJSON(res, data) : notFound(res);
    }

    // -------------------------
    // POST /opgaver
    // -------------------------
    if (method === "POST" && pathName === "/opgaver") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const newTask = createTask(JSON.parse(body));
            sendJSON(res, newTask);
        });
        return;
    }

    // -------------------------
    // PUT /opgaver/:id
    // -------------------------
    if (method === "PUT" && taskMatch) {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const updated = updateTask(Number(taskMatch[1]), JSON.parse(body));
            return updated ? sendJSON(res, updated) : notFound(res);
        });
        return;
    }

    // -------------------------
    // DELETE /opgaver/:id
    // -------------------------
    if (method === "DELETE" && taskMatch) {
        const ok = deleteTask(Number(taskMatch[1]));
        if (!ok) return notFound(res);

        res.writeHead(204);
        return res.end();
    }

    // Fallback
    notFound(res);
});

// ------------------------------------------------------
// ⭐ LØSNING 1: GENERÉR JSON-FILEN VED SERVERSTART ⭐
// ------------------------------------------------------

try {
    const exportPath = path.join(__dirname, "export/opgaver.json");
    const tasks = exportAllTasks();

    fs.writeFileSync(exportPath, JSON.stringify(tasks, null, 2), "utf8");

    console.log("Exportfil genereret ved serverstart:", exportPath);
} catch (err) {
    console.error("Fejl ved generering af export-fil:", err);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port " + PORT));
