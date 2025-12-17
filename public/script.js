// varianler
const API_URL = "https://gruppe2-opgaver.onrender.com/opgaver";

let editMode = false;
let editID = null;
let allTasks = [];
let filteredTasks = [];
let currentPage = 1;
let rowsPerPage = 10;
let sortColumn = null;
let sortDirection = "asc";

// initiering
document.addEventListener("DOMContentLoaded", function () {
    DKFDS.init();
    loadTasks();
});

// Api funktioner
async function loadTasks() {
    try {
        const res = await fetch(API_URL);
        allTasks = await res.json();
        filteredTasks = allTasks;
        currentPage = 1;
        renderPaginatedTasks();
    } catch (error) {
        console.error(error);
        alert("Kunne ikke hente opgaver, prøv igen senere")
    }

}

async function createTask() {
    if (!validateForm()) return;
    try {
        const task = getFormData();
        await fetch(`${API_URL}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task)
        });

        clearForm();
        loadTasks();
        closeModal("open");

    } catch (error) {
        console.error(error);
        alert("Kunne ikke oprette opgaven, prøv igen senere")
    }
}

async function startEdit(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const task = await res.json();

        document.getElementById("title").value = task.Title;
        document.getElementById("description").value = task.Description;
        document.getElementById("type").value = task.Type;
        document.getElementById("location").value = task.Location;
        document.getElementById("radius").value = task.Radius;
        document.getElementById("latitude").value = formatCoord(task.Latitude);
        document.getElementById("longitude").value = formatCoord(task.Longitude);
        document.getElementById("options").value = task.Options.join(";");
        document.getElementById("activationCondition").value = task.ActivationCondition;
        document.getElementById("difficulty").value = task.Difficulty;

        editMode = true;
        editID = id;

        document.getElementById("modal-example-heading").textContent = "Rediger opgave";
        document.querySelector('button[onclick="createTask()"]').style.display = "none";
        document.getElementById("updateBtn").style.display = "block";

        openModal("open");

    } catch (error) {
        console.error(error);
        alert("Kunne ikke redigere opgaven, prøv igen senere")
    }
}

async function updateTask() {
    if (!validateForm()) return;
    try {
        const updated = getFormData();
        await fetch(`${API_URL}/${editID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });

        clearForm();
        loadTasks();
        closeModal("open");
    } catch (error) {
        console.error(error);
        alert("Kunne ikke opdatere opgaven, prøv igen senere")
    }
}

async function deleteTask(id) {
    if (!confirm("Er du sikker på, at du vil slette denne opgave?")) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        loadTasks();

    } catch (error) {
        console.error(error);
        alert("Kunne ikke slette opgaven, prøv igen senere")
    }
}

// rendering
function formatCoord(value) {
    if (value === null || value === undefined || value === "") return "";
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(4) : "";
}


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
            { label: "Latitude", value: formatCoord(task.Latitude) },
            { label: "Longitude", value: formatCoord(task.Longitude) }
        ];

        columns.forEach(col => {
            const td = document.createElement("td");
            td.setAttribute("data-title", col.label);

            if (col.label === "Options" && Array.isArray(task.Options)) {
                td.innerHTML = "";
                task.Options.forEach(option => {
                    const span = document.createElement("span");
                    span.className = "task-option";
                    span.textContent = option;
                    td.appendChild(span);
                });
            } else {
                td.textContent = col.value;
            }

            tr.appendChild(td);
        });

        // Handlinger (desktop)
        const actionTd = document.createElement("td");
        actionTd.className = "actions-cell";

        const actions = document.createElement("div");
        actions.className = "actions desktop-only";

        const trigger = document.createElement("button");
        trigger.className = "actions-trigger";
        trigger.innerHTML = `<span class="material-symbols-outlined">more_vert</span>`;

        const menu = document.createElement("div");
        menu.className = "actions-menu";

        const editBtn = document.createElement("button");
        editBtn.className = "editBtn";
        editBtn.innerHTML = `<span class="material-symbols-outlined">edit_square</span> Rediger`;
        editBtn.onclick = () => startEdit(task.ID);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "danger";
        deleteBtn.innerHTML = `<span class="material-symbols-outlined">delete</span> Slet`;
        deleteBtn.onclick = () => deleteTask(task.ID);

        const separator = document.createElement("span");
        separator.className = "actions-separator";

        menu.appendChild(editBtn);
        menu.appendChild(separator);
        menu.appendChild(deleteBtn);

        trigger.onclick = (e) => {
            e.stopPropagation();
            toggleActions(actions);
        };

        actions.appendChild(trigger);
        actions.appendChild(menu);

        // Handlinger (mobil)
        const mobileActions = document.createElement("div");
        mobileActions.className = "mobile-actions mobile-only";

        const mobileEdit = document.createElement("button");
        mobileEdit.className = "button button-primary";
        mobileEdit.textContent = "Rediger";
        mobileEdit.onclick = () => startEdit(task.ID);

        const mobileDelete = document.createElement("button");
        mobileDelete.className = "button button-secondary";
        mobileDelete.textContent = "Slet";
        mobileDelete.onclick = () => deleteTask(task.ID);

        mobileActions.appendChild(mobileEdit);
        mobileActions.appendChild(mobileDelete);

        actionTd.appendChild(actions);
        actionTd.appendChild(mobileActions);
        tr.appendChild(actionTd);

        tbody.appendChild(tr);
    });
}

function toggleActions(actionsEl) {
    document.querySelectorAll(".actions.open").forEach(el => {
        if (el !== actionsEl) el.classList.remove("open");
    });
    actionsEl.classList.toggle("open");
}

document.addEventListener("click", () => {
    document.querySelectorAll(".actions.open").forEach(el => el.classList.remove("open"));
});


// Pagination
function renderPaginatedTasks() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedTasks = filteredTasks.slice(start, end);

    renderTasks(paginatedTasks);
    updatePaginationInfo();
}

function updatePaginationInfo() {
    const total = filteredTasks.length;
    const start = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(start + rowsPerPage - 1, total);

    document.querySelector(".displayed-rows").textContent = `${start}-${end}`;
    document.querySelector(".total-rows").textContent = total;
    document.getElementById("current-page").textContent = `Side ${currentPage}`;
}

// søgning
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

// sortering
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

        if (column === "ID") return sortDirection === "asc" ? valueA - valueB : valueB - valueA;

        valueA = valueA ? valueA.toString().toLowerCase() : "";
        valueB = valueB ? valueB.toString().toLowerCase() : "";

        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    currentPage = 1;
    renderPaginatedTasks();
    updateSortIcons();
}

function updateSortIcons() {
    document.querySelectorAll("th button").forEach(btn => {
        const span = btn.querySelector("span");
        if (span) span.textContent = "unfold_more";
    });

    const activeBtn = document.querySelector(`[data-sort="${sortColumn}"]`);
    if (!activeBtn) return;

    const activeSpan = activeBtn.querySelector("span");
    if (!activeSpan) return;

    activeSpan.textContent = sortDirection === "asc" ? "keyboard_arrow_up" : "keyboard_arrow_down";
}

// modal og form
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return console.warn(`Modal med id ${modalId} findes ikke`)
    modal.classList.add("fds-modal--open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.getElementById("modal-overlay").classList.add("active");
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return console.warn(`Modal med id ${modalId} findes ikke`)
    modal.classList.remove("fds-modal--open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.getElementById("modal-overlay").classList.remove("active");
    clearValidationErrors();
}

function openCreateModal() {
    clearForm();
    clearValidationErrors();

    document.getElementById("modal-example-heading").textContent = "Opret ny opgave";
    document.querySelector('button[onclick="createTask()"]').style.display = "block";
    document.getElementById("updateBtn").style.display = "none";

    openModal("open");
}

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
        Difficulty: document.getElementById("difficulty").value
    };
}

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
    document.getElementById("difficulty").value = "";
}

// validering
function validateForm() {
    const requiredFields = [
        "title", "description", "type", "location",
        "radius", "latitude", "longitude", "options",
        "activationCondition", "difficulty"
    ];

    let isValid = true;

    requiredFields.forEach(id => {
        const input = document.getElementById(id);

        if (!input.value.trim()) {
            isValid = false;
            input.classList.add("error");

            if (!input.nextElementSibling || !input.nextElementSibling.classList.contains("error-message")) {
                const errorMessage = document.createElement("span");
                errorMessage.className = "error-message";
                errorMessage.textContent = "Dette felt skal udfyldes";
                input.parentNode.appendChild(errorMessage);
            }
        } else {
            input.classList.remove("error");
            if (input.nextElementSibling && input.nextElementSibling.classList.contains("error-message")) {
                input.nextElementSibling.remove();
            }
        }
    });

    return isValid;
}

function clearValidationErrors() {
    document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
    document.querySelectorAll(".error-message").forEach(el => el.remove());
}

// event listeners
document.querySelectorAll("[data-modal-close]").forEach(btn => {
    btn.addEventListener("click", () => {
        const modal = btn.closest(".fds-modal");
        closeModal(modal.id);
    });
});

document.getElementById("search-btn").addEventListener("click", searchTasks);

document.getElementById("search-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchTasks();
    }
});

document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderPaginatedTasks();
    }
});

document.getElementById("next-page").addEventListener("click", () => {
    const maxPages = Math.ceil(filteredTasks.length / rowsPerPage);
    if (currentPage < maxPages) {
        currentPage++;
        renderPaginatedTasks();
    }
});

document.getElementById("pagination-pages").addEventListener("change", (e) => {
    if (e.target.value === "all") {
        rowsPerPage = filteredTasks.length;
        currentPage = 1;
    } else {
        rowsPerPage = Number(e.target.value);
    }
    renderPaginatedTasks();
});

document.querySelectorAll("th button[data-sort]").forEach(btn => {
    btn.addEventListener("click", () => sortTasks(btn.dataset.sort));
});
