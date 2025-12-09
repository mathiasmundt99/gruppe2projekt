const API_URL = "http://localhost:3000";  // Skiftes til Render-URL senere

// Hent alle opgaver
async function loadTasks() {
    const res = await fetch(`${API_URL}/opgaver`);
    const tasks = await res.json();

    const list = document.getElementById("task-list");
    list.innerHTML = "";

    tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "task";
        div.innerHTML = `
            <strong>${task.Title}</strong><br>
            ${task.Description}<br>
            <small>Type: ${task.Type} | ID: ${task.ID}</small>
        `;
        list.appendChild(div);
    });
}

// Opret opgave
async function createTask() {
    const task = {
        Title: document.getElementById("title").value,
        Description: document.getElementById("description").value,
        Type: document.getElementById("type").value,
        Location: document.getElementById("location").value,
        Radius: Number(document.getElementById("radius").value),
        Latitude: Number(document.getElementById("latitude").value),
        Longitude: Number(document.getElementById("longitude").value)
    };

    await fetch(`${API_URL}/opgaver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });

    loadTasks(); // opdater listen
}

// Når siden loader
window.onload = loadTasks;
