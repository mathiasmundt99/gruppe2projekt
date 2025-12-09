// server.js — Node HTTP server uden Express

const http = require("http");
const url = require("url");
const {
    getAllTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    exportTask
} = require("./opgaveService");

// CORS headers (gør det muligt for frontend + Team 2/3 at hente data)
function setHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer((req, res) => {
    setHeaders(res);

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Preflight (til POST/PUT)
    if (method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // -------------------------
    // GET /opgaver
    // -------------------------
    if (method === "GET" && path === "/opgaver") {
        const data = getAllTasks();
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
    }

    // -------------------------
    // GET /opgaver/:id
    // -------------------------
    const taskMatch = path.match(/^\/opgaver\/(\d+)$/);
    if (method === "GET" && taskMatch) {
        const id = taskMatch[1];
        const task = getTask(id);

        if (!task) {
            res.writeHead(404);
            return res.end("Not Found");
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(task));
    }

    // -------------------------
    // GET /opgaver/:id/export
    // -------------------------
    const exportMatch = path.match(/^\/opgaver\/(\d+)\/export$/);
    if (method === "GET" && exportMatch) {
        const id = exportMatch[1];
        const data = exportTask(id);

        if (!data) {
            res.writeHead(404);
            return res.end("Not Found");
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
    }

    // -------------------------
    // POST /opgaver
    // -------------------------
    if (method === "POST" && path === "/opgaver") {
        let body = "";

        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const newTask = createTask(JSON.parse(body));
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(newTask));
        });

        return;
    }

    // -------------------------
    // PUT /opgaver/:id
    // -------------------------
    if (method === "PUT" && taskMatch) {
        const id = taskMatch[1];
        let body = "";

        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const updates = JSON.parse(body);
            const updatedTask = updateTask(id, updates);

            if (!updatedTask) {
                res.writeHead(404);
                return res.end("Not Found");
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(updatedTask));
        });

        return;
    }

    // -------------------------
    // DELETE /opgaver/:id
    // -------------------------
    if (method === "DELETE" && taskMatch) {
        const id = taskMatch[1];
        const ok = deleteTask(id);

        if (!ok) {
            res.writeHead(404);
            return res.end("Not Found");
        }

        res.writeHead(204);
        return res.end();
    }

    // -------------------------
    // Fallback
    // -------------------------
    res.writeHead(404);
    res.end("Not Found");
});

// Render bruger process.env.PORT
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
