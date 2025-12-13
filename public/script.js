document.addEventListener("DOMContentLoaded", function() {
    DKFDS.init();
    loadTasks();
});

const API_URL = "https://gruppe2-opgaver.onrender.com/opgaver";

let editMode = false;
let editID = null;

// Hent alle opgaver
async function loadTasks() {
    const res = await fetch(API_URL);
    const tasks = await res.json();

    const tbody = document.querySelector("#task-table tbody");
    tbody.innerHTML = ""; 

    tasks.forEach(task => {
    const tr = document.createElement("tr");

    const columns = [
        { label: "ID", value: task.ID },
        { label: "Title", value: task.Title },
        { label: "Type", value: task.Type },
        { label: "Location", value: task.Location },
        { label: "Options", value: Array.isArray(task.Options) ? task.Options.join(", ") : task.Options },
        { label: "Latitude", value: task.Latitude },
        { label: "Longitude", value: task.Longitude }
    ];

    columns.forEach(col => {
        const td = document.createElement("td");
        td.setAttribute("data-title", col.label);
        td.textContent = col.value;
        tr.appendChild(td);
    });

    document.querySelector("#task-table tbody").appendChild(tr);
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
    document.getElementById("options").value = task.Options.join(";");
    document.getElementById("activationCondition").value = task.ActivationCondition;
    document.getElementById("activated").value = task.Activated ? "true" : "false";
    document.getElementById("completed").value = task.Completed ? "true" : "false";
    document.getElementById("difficulty").value = task.Difficulty;


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
        Longitude: Number(document.getElementById("longitude").value),

        Options: document.getElementById("options").value,
        ActivationCondition: document.getElementById("activationCondition").value,
        Activated: document.getElementById("activated").value === "true",
        Completed: document.getElementById("completed").value === "true",
        Difficulty: document.getElementById("difficulty").value
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
    document.getElementById("options").value = "";
    document.getElementById("activationCondition").value = "";
    document.getElementById("activated").value = "false";
    document.getElementById("completed").value = "false";
    document.getElementById("difficulty").value = "";

}

window.onload = loadTasks;
