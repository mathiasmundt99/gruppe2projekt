const API_URL = "/api/tasks";

// --------------------------------------------------
// Hent alle opgaver
// --------------------------------------------------
async function loadTasks() {
    const res = await fetch(API_URL);
    const tasks = await res.json();

    const tbody = document.querySelector("#taskTable tbody");
    tbody.innerHTML = "";

    tasks.forEach(task => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${task.titel}</td>
            <td>${task.type}</td>
            <td>${task.zone}</td>
            <td>
                <button onclick="deleteTask('${task.id}')">🗑 Slet</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// --------------------------------------------------
// Opret ny opgave
// --------------------------------------------------
document.querySelector("#taskForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        titel: document.querySelector("#title").value,
        beskrivelse: document.querySelector("#description").value,
        type: document.querySelector("#type").value,
        zone: document.querySelector("#zone").value,
        radius: Number(document.querySelector("#radius").value) || null,
        latitude: Number(document.querySelector("#latitude").value) || null,
        longitude: Number(document.querySelector("#longitude").value) || null,
        options: document.querySelector("#options").value.split(",").map(o => o.trim()).filter(Boolean)
    };

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    e.target.reset();
    loadTasks();
});

// --------------------------------------------------
// Slet opgave
// --------------------------------------------------
async function deleteTask(id) {
    if (!confirm("Er du sikker på at du vil slette opgaven?")) return;

    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadTasks();
}

// Start app
loadTasks();
