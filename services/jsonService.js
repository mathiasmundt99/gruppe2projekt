const path = require("path");
const fs = require("fs");

const exportDir = path.join(__dirname, "exports");
const exportPath = path.join(exportDir, "opgaver.json");

function exportTasksToJson(tasks) {
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir);
    }

    // Kun felterne som er relevante for Team 2 & 3
    const minimal = tasks.map((t) => ({
        id: t.id,
        titel: t.titel,
        beskrivelse: t.beskrivelse,
        lokation: t.lokation, // { type: "Point"/"NamedLocation", coordinates/name }
        radius: t.radius,
        zone: t.zone,
        type: t.type // "land"/"sø"
    }));

    fs.writeFileSync(exportPath, JSON.stringify(minimal, null, 2), "utf8");
    console.log(`Eksporteret ${minimal.length} opgaver til ${exportPath}`);
}

module.exports = {
    exportTasksToJson
};
