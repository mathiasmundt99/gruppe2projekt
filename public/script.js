document.addEventListener("DOMContentLoaded", function() {
    DKFDS.init();
    loadTasks();
});

const API_URL = "https://gruppe2-opgaver.onrender.com/opgaver";

let editMode = false;
let editID = null;
let allTasks = [];
let currentPage = 1;
let rowsPerPage = 10;
let filteredTasks = [];
let sortColumn = null;
let sortDirection = "asc";

// Hent alle opgaver
async function loadTasks() {
   const res = await fetch(API_URL);
    allTasks = await res.json();
    filteredTasks = allTasks;
    currentPage = 1;
    renderPaginatedTasks();
}

// Opret alle opgaver
function renderTasks(tasks) {
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

        const actionTd = document.createElement("td");

        const deleteBtn = document.createElement("button");
        const editBtn = document.createElement("button");

        deleteBtn.className = "button button-primary";
        editBtn.className = "button button-secondary";

        deleteBtn.textContent = "Slet";
        editBtn.textContent = "Rediger";

        deleteBtn.onclick = () => deleteTask(task.ID);
        editBtn.onclick = () => startEdit(task.ID);

        actionTd.appendChild(editBtn);
        actionTd.appendChild(deleteBtn);
        tr.appendChild(actionTd);

        tbody.appendChild(tr);
        });
}

// søgefunktion
function searchTasks() {
    const searchValue = document.getElementById("search-input").value.toLowerCase();

    filteredTasks = allTasks.filter(task => 
        task.Title.toLowerCase().includes(searchValue) ||
        task.Type.toLowerCase().includes(searchValue) ||
        task.Location.toLowerCase().includes(searchValue)
    );

    currentPage = 1;
    renderPaginatedTasks();
}

// pagination
function renderPaginatedTasks() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    const paginatedTasks = filteredTasks.slice(start, end);

    renderTasks(paginatedTasks);
    updatePaginationInfo();
}

// opdater pagination info på frontenden
function updatePaginationInfo() {
    const total = filteredTasks.length;
    const start = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(start + rowsPerPage - 1, total);

    document.querySelector(".displayed-rows").textContent = `${start}-${end}`;
    document.querySelector(".total-rows").textContent = total;
    document.getElementById("current-page").textContent = `Side ${currentPage}`;
}

// sorter kolonner  i tabel
function sortTasks(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
        sortColumn = column;
        sortDirection = "asc";
    }

    filteredTasks.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];

        if (column === "ID") {
            return sortDirection === "asc"
                ? valueA - valueB
                : valueB - valueA;
        }

        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();

        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    currentPage = 1;
    renderPaginatedTasks();
    updateSortIcons();
}

// opdater sorter ikon 
function updateSortIcons() {
    document.querySelectorAll("th button").forEach(btn => {
        const span = btn.querySelector("span");
        if (span) {
            span.textContent = "unfold_more";
        }
    });

    const activeBtn = document.querySelector(`[data-sort="${sortColumn}"]`);
    if (!activeBtn) return;

    const activeSpan = activeBtn.querySelector("span");
    if (!activeSpan) return;

    activeSpan.textContent =
        sortDirection === "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down";
}

// Opret opgave
async function createTask() {
    const task = getFormData();
    await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });

    clearForm();
    loadTasks();
}

// åben modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add("fds-modal--open");
    modal.setAttribute("aria-hidden", "false");

     document.body.classList.add("modal-open");
}

// luk modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove("fds-modal--open");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
}

// modal specifikt til opret opgave
function openCreateModal() {
    clearForm();

    document.getElementById("modal-example-heading").textContent = "Opret ny opgave";

    document.querySelector('button[onclick="createTask()"]').style.display = "block";
    document.getElementById("updateBtn").style.display = "none";


    const modal = document.getElementById("open");
    modal.classList.add("fds-modal--open");
    modal.setAttribute("aria-hidden", "false");
}

// rediger opgave
async function startEdit(id) {
    const res = await fetch(`${API_URL}/${id}`);
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

    // Sæt overskrift
    document.getElementById("modal-example-heading").textContent = "Rediger opgave";

    // Vis/skjul knapper
    document.querySelector('button[onclick="createTask()"]').style.display = "none";
    document.getElementById("updateBtn").style.display = "block";

   openModal("open");
}

// DELETE opgave
async function deleteTask(id) {
    if (!confirm("Er du sikker på, at du vil slette denne opgave?")) return;

    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadTasks();
}

// Gem ændringer
async function updateTask() {
    const updated = getFormData();

    await fetch(`${API_URL}/${editID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    });

    clearForm();
    loadTasks();

    // Luk modal
    const modal = document.getElementById("open");
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("fds-modal--open");

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

// addEventListeners
document.querySelectorAll("[data-modal-close]").forEach(btn => {
    btn.addEventListener("click", () => {
        const modal = btn.closest(".fds-modal");
        modal.setAttribute("aria-hidden", "true");
        modal.classList.remove("fds-modal--open");
    });
});

// klik på søgeknap
document.getElementById("search-btn").addEventListener("click", searchTasks)

// forrige side pagination knap
document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderPaginatedTasks();
    }
});

// næste side pagination knap
document.getElementById("next-page").addEventListener("click", () => {
    const maxPages = Math.ceil(filteredTasks.length / rowsPerPage);

    if (currentPage < maxPages) {
        currentPage++;
        renderPaginatedTasks();
    }
});

// ændring af hvor mange opgaver man vil se på hver side
document.getElementById("pagination-pages").addEventListener("change", (e) => {
    rowsPerPage = e.target.value === "all"
        ? Infinity
        : Number(e.target.value);

    currentPage = 1;
    renderPaginatedTasks();
});

document.querySelectorAll("th button[data-sort]").forEach(btn => {
    btn.addEventListener("click", () => {
        sortTasks(btn.dataset.sort);
    });
});

