const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const { writeExportFile } = require("./opgaveService");

const {
    getAllTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    exportTask,
    exportAllTasks
} = require("./opgaveService");

// hjælper funktioner

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

// server

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

//  static file routing
    if (method === "GET" && pathName.startsWith("/staticfiles/")) {

        const fileName = pathName.replace("/staticfiles/", "");
        const filePath = path.join(__dirname, "staticfiles", fileName);

        console.log("Henter statisk fil:", filePath);

        if (fs.existsSync(filePath)) {
    try {
        const file = fs.readFileSync(filePath);
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="${fileName}"`
        });
        return res.end(file);
    } catch (error) {
        console.error("Fejl ved læsning af fil:", error);
        res.writeHead(500);
        return res.end("Internal Server Error");
    }
}

        return notFound(res);
    }

    // GET /opgaver
    if (method === "GET" && pathName === "/opgaver") {
    try {
        const tasks = getAllTasks();
        return sendJSON(res, tasks);
    } catch (error) {
        console.error("Fejl ved hentning af alle opgaver:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
}

    // GET /opgaver/id
    const taskMatch = pathName.match(/^\/opgaver\/(\d+)$/);
if (method === "GET" && taskMatch) {
    const id = Number(taskMatch[1]);
    try {
        const task = getTask(id);
        return task ? sendJSON(res, task) : notFound(res);
    } catch (error) {
        console.error(`Fejl ved hentning af opgave ${id}:`, error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
}

     // GET /export
   if (method === "GET" && pathName === "/export") {
    try {
        const data = exportAllTasks();
        return sendJSON(res, data);
    } catch (error) {
        console.error("Fejl ved eksport af alle opgaver:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
}

     // GET /export/id
    const exportMatch = pathName.match(/^\/export\/(\d+)$/);
if (method === "GET" && exportMatch) {
    const id = Number(exportMatch[1]);
    try {
        const data = exportTask(id);
        return data ? sendJSON(res, data) : notFound(res);
    } catch (error) {
        console.error(`Fejl ved eksport af opgave ${id}:`, error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
}

//    POST /opgaver
    if (method === "POST" && pathName === "/opgaver") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
        try {
            const newTask = createTask(JSON.parse(body));
            sendJSON(res, newTask);
        } catch (error) {
            console.error("Fejl ved oprettelse af opgave:", error);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Ugyldig JSON" }));
        }
    });
    return;
}

    //    POST /opgaver/id
    if (method === "PUT" && taskMatch) {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            try{
            const updated = updateTask(Number(taskMatch[1]), JSON.parse(body));
            return updated ? sendJSON(res, updated) : notFound(res);
            } catch(error){
                console.error("Fejl ved oprettelse af opgave:", error);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Ugyldig JSON" }));
            }
            
        });
        return;
    }

    // DELETE /opgaver/id

    if (method === "DELETE" && taskMatch) {
        const ok = deleteTask(Number(taskMatch[1]));
        if (!ok) return notFound(res);
    try {
        console.log(`Task ${id} slettet succesfuldt`);
        res.writeHead(204); // No Content
        return res.end();
    } catch (error) {
        console.error(`Fejl ved sletning af opgave ${id}:`, error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
}

    // fallback
    notFound(res);
});


// start server
const PORT = process.env.PORT || 3000;
writeExportFile();
server.listen(PORT, () => console.log("Server running on port " + PORT));
