const API_URL = "https://gruppe2-opgaver.onrender.com";

let editMode = false;
let editID = null;

// Hent alle opgaver
async function loadTasks() {
    const res = await fetch(`${API_URL}/opgaver`);
    const tasks = await res.json();

    const list = document.getElementById("task-list");
    list.innerHTML = "";

    tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "task";

        let html = `
            <h3>${task.Title}</h3>
            <p>${task.Description}</p>
            <ul>
        `;

        for (const key in task) {
            let value = task[key];

            if (Array.isArray(value)) {
                value = value.join(", ");
            }

            html += `<li><strong>${key}:</strong> ${value}</li>`;
        }

        html += `
            </ul>
            <button onclick="startEdit(${task.ID})">Rediger</button>
            <button onclick="deleteTask(${task.ID})" style="margin-left:10px;">Slet</button>
        `;

        div.innerHTML = html;
        list.appendChild(div);
    });
}


// Opret opgave
async function createTask() {
    const task = getFormData();
    await fetch(`${API_URL}/opgaver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });

    clearForm();
    loadTasks();
}

// DELETE opgave
async function deleteTask(id) {
    if (!confirm("Er du sikker på, at du vil slette denne opgave?")) return;

    await fetch(`${API_URL}/opgaver/${id}`, { method: "DELETE" });
    loadTasks();
}

// Start redigering af opgave
async function startEdit(id) {
    const res = await fetch(`${API_URL}/opgaver/${id}`);
    const task = await res.json();

    // Udfyld formular
    document.getElementById("title").value = task.Title;
    document.getElementById("description").value = task.Description;
    document.getElementById("type").value = task.Type;
    document.getElementById("location").value = task.Location;
    document.getElementById("radius").value = task.Radius;
    document.getElementById("latitude").value = task.Latitude;
    document.getElementById("longitude").value = task.Longitude;

    // Skift UI til rediger-tilstand
    editMode = true;
    editID = id;
    document.querySelector('button[onclick="createTask()"]').style.display = "none";
    document.getElementById("updateBtn").style.display = "block";
}

// Gem ændringer
async function updateTask() {
    const updated = getFormData();

    await fetch(`${API_URL}/opgaver/${editID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    });

    clearForm();
    loadTasks();

    // Gå tilbage til opret-tilstand
    editMode = false;
    editID = null;
    document.querySelector('button[onclick="createTask()"]').style.display = "block";
    document.getElementById("updateBtn").style.display = "none";
}

// Hent input fra formularen
function getFormData() {
    return {
        Title: document.getElementById("title").value,
        Description: document.getElementById("description").value,
        Type: document.getElementById("type").value,
        Location: document.getElementById("location").value,
        Radius: Number(document.getElementById("radius").value),
        Latitude: Number(document.getElementById("latitude").value),
        Longitude: Number(document.getElementById("longitude").value)
    };
}

// Ryd formular
function clearForm() {
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("type").value = "";
    document.getElementById("location").value = "";
    document.getElementById("radius").value = "";
    document.getElementById("latitude").value = "";
    document.getElementById("longitude").value = "";
}

window.onload = loadTasks;
