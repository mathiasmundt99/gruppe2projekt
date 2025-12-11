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

// ------------------------------------------------------
// Helper functions
// ------------------------------------------------------

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

// ------------------------------------------------------
// Server
// ------------------------------------------------------

const server = http.createServer((req, res) => {
    setHeaders(res);

    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname;
    const method = req.method;

    // CORS preflight
    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // ------------------------------------------------------
    // STATIC FILE ROUTING FOR /staticfiles/xxxx.json
    // ------------------------------------------------------
    if (method === "GET" && pathName.startsWith("/staticfiles/")) {

        const fileName = pathName.replace("/staticfiles/", "");
        const filePath = path.join(__dirname, "staticfiles", fileName);

        console.log("Henter statisk fil:", filePath);

        if (fs.existsSync(filePath)) {
            const file = fs.readFileSync(filePath);
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${fileName}"`
            });
            return res.end(file);
        }

        return notFound(res);
    }

    // ------------------------------------------------------
    // GET /opgaver
    // ------------------------------------------------------
    if (method === "GET" && pathName === "/opgaver") {
        return sendJSON(res, getAllTasks());
    }

    // ------------------------------------------------------
    // GET /opgaver/:id
    // ------------------------------------------------------
    const taskMatch = pathName.match(/^\/opgaver\/(\d+)$/);
    if (method === "GET" && taskMatch) {
        const id = Number(taskMatch[1]);
        const task = getTask(id);

        return task ? sendJSON(res, task) : notFound(res);
    }

    // ------------------------------------------------------
    // GET /export  (shared JSON format)
    // ------------------------------------------------------
    if (method === "GET" && pathName === "/export") {
        return sendJSON(res, exportAllTasks());
    }

    // ------------------------------------------------------
    // GET /export/:id
    // ------------------------------------------------------
    const exportMatch = pathName.match(/^\/export\/(\d+)$/);
    if (method === "GET" && exportMatch) {
        const id = Number(exportMatch[1]);
        const data = exportTask(id);

        return data ? sendJSON(res, data) : notFound(res);
    }

    // ------------------------------------------------------
    // POST /opgaver
    // ------------------------------------------------------
    if (method === "POST" && pathName === "/opgaver") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const newTask = createTask(JSON.parse(body));
            sendJSON(res, newTask);
        });
        return;
    }

    // ------------------------------------------------------
    // PUT /opgaver/:id
    // ------------------------------------------------------
    if (method === "PUT" && taskMatch) {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const updated = updateTask(Number(taskMatch[1]), JSON.parse(body));
            return updated ? sendJSON(res, updated) : notFound(res);
        });
        return;
    }

    // ------------------------------------------------------
    // DELETE /opgaver/:id
    // ------------------------------------------------------
    if (method === "DELETE" && taskMatch) {
        const ok = deleteTask(Number(taskMatch[1]));
        if (!ok) return notFound(res);

        res.writeHead(204);
        return res.end();
    }

    // ------------------------------------------------------
    // Fallback
    // ------------------------------------------------------
    notFound(res);
});

// ------------------------------------------------------
// GENERATE STATIC FILE AT SERVER START
// ------------------------------------------------------

(function generateInitialExportFile() {
    try {
        const dirPath = path.join(__dirname, "staticfiles");
        const filePath = path.join(dirPath, "opgaver.json");

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }

        const tasks = exportAllTasks();
        fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf8");

        console.log("Static exportfil genereret ved serverstart:", filePath);
    } catch (err) {
        console.error("Fejl ved generering af export-fil:", err);
    }
})();

// ------------------------------------------------------
// Start server
// ------------------------------------------------------

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port " + PORT));
