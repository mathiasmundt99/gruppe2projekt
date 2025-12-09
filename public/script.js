// Globals
let allTasks = [];
let currentEditTaskId = null;

// DOM references
const tasksTableBody = document.getElementById("tasksTableBody");
const taskCountEl = document.getElementById("taskCount");

// Search/filter
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");

// Buttons
const refreshBtn = document.getElementById("refreshBtn");
const exportBtn = document.getElementById("exportBtn");
const addTaskBtn = document.getElementById("addTaskBtn");

// Theme
const themeToggle = document.getElementById("themeToggle");

// Drawer
const editDrawer = document.getElementById("editDrawer");
const editDrawerBackdrop = document.getElementById("editDrawerBackdrop");
const closeEditDrawerBtn = document.getElementById("closeEditDrawerBtn");
const editTaskForm = document.getElementById("editTaskForm");
const editTaskIdLabel = document.getElementById("editTaskIdLabel");
const editTaskIdInput = document.getElementById("editTaskId");
const deleteTaskBtn = document.getElementById("deleteTaskBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Drawer fields
const editTitel = document.getElementById("editTitel");
const editBeskrivelse = document.getElementById("editBeskrivelse");
const editType = document.getElementById("editType");
const editZone = document.getElementById("editZone");
const editRadius = document.getElementById("editRadius");
const editDifficulty = document.getElementById("editDifficulty");
const editLatitude = document.getElementById("editLatitude");
const editLongitude = document.getElementById("editLongitude");
const editDuration = document.getElementById("editDuration");
const editActivation = document.getElementById("editActivation");
const editOptions = document.getElementById("editOptions");
const editActivated = document.getElementById("editActivated");
const editCompleted = document.getElementById("editCompleted");

// New task modal
const newTaskModal = document.getElementById("newTaskModal");
const newTaskBackdrop = document.getElementById("newTaskBackdrop");
const newTaskForm = document.getElementById("newTaskForm");
const closeNewTaskBtn = document.getElementById("closeNewTaskBtn");
const cancelNewTaskBtn = document.getElementById("cancelNewTaskBtn");

// Helper: theme handling
function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
        document.body.classList.add("dark");
        themeToggle.checked = true;
    } else {
        document.body.classList.remove("dark");
        themeToggle.checked = false;
    }

    themeToggle.addEventListener("change", () => {
        const isDark = themeToggle.checked;
        if (isDark) {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    });
}

// API helpers
async function fetchTasks() {
    const res = await fetch("/api/tasks");
    if (!res.ok) {
        alert("Kunne ikke hente opgaver");
        return [];
    }
    return res.json();
}

async function updateTask(id, payload) {
    const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        throw new Error("Fejl ved opdatering af opgave");
    }
    return res.json();
}

async function deleteTask(id) {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
        throw new Error("Fejl ved sletning af opgave");
    }
    return res.json();
}

async function createTask(payload) {
    const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        throw new Error("Fejl ved oprettelse af opgave");
    }
    return res.json();
}

// Rendering

function renderTasksTable(tasks) {
    tasksTableBody.innerHTML = "";
    taskCountEl.textContent =
        tasks.length === 1
            ? "1 opgave"
            : `${tasks.length} opgaver`;

    tasks.forEach((t) => {
        const tr = document.createElement("tr");
        tr.dataset.id = t.id;

        const optionsContent =
            Array.isArray(t.options) && t.options.length
                ? t.options
                : [];

        tr.innerHTML = `
      <td>${t.id}</td>
      <td>${t.titel || ""}</td>
      <td>${t.type || ""}</td>
      <td>${t.zone || ""}</td>
      <td>${t.latitude ?? ""}</td>
      <td>${t.longitude ?? ""}</td>
      <td>
        <div class="chips">
          ${optionsContent
                .map((opt) => `<span class="chip">${escapeHtml(opt)}</span>`)
                .join("")}
        </div>
      </td>
      <td>
        <button class="btn secondary btn-compact" data-action="edit">Edit</button>
      </td>
    `;

        tasksTableBody.appendChild(tr);
    });
}

// Simple HTML escape
function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Filter logic

function applyFilters() {
    const q = searchInput.value.toLowerCase().trim();
    const typeFilter = filterType.value;

    let filtered = [...allTasks];

    if (q) {
        filtered = filtered.filter((t) => {
            const hay = `${t.titel || ""} ${t.zone || ""} ${t.beskrivelse || ""
                }`.toLowerCase();
            return hay.includes(q);
        });
    }

    if (typeFilter) {
        filtered = filtered.filter((t) => t.type === typeFilter);
    }

    renderTasksTable(filtered);
}

// Drawer helpers

function openEditDrawer(task) {
    currentEditTaskId = task.id;
    editTaskIdLabel.textContent = task.id;
    editTaskIdInput.value = task.id;

    editTitel.value = task.titel || "";
    editBeskrivelse.value = task.beskrivelse || "";
    editType.value = task.type || "land";
    editZone.value = task.zone || "";
    editRadius.value = task.radius ?? "";
    editDifficulty.value = task.difficulty || "";
    editLatitude.value = task.latitude ?? "";
    editLongitude.value = task.longitude ?? "";
    editDuration.value = task.duration || "";
    editActivation.value = task.activationCondition || "";
    editOptions.value = Array.isArray(task.options)
        ? task.options.join(";")
        : "";
    editActivated.checked = !!task.activated;
    editCompleted.checked = !!task.completed;

    editDrawer.classList.add("open");
}

function closeEditDrawer() {
    currentEditTaskId = null;
    editDrawer.classList.remove("open");
}

// Modal helpers

function openNewTaskModal() {
    newTaskForm.reset();
    newTaskModal.classList.add("open");
}

function closeNewTaskModal() {
    newTaskModal.classList.remove("open");
}

// Extract payload helpers

function parseOptions(str) {
    if (!str) return [];
    return str
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

function parseNumberOrNull(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
}

function buildTaskPayloadFromForm(form) {
    const formData = new FormData(form);

    return {
        titel: formData.get("titel") || "",
        beskrivelse: formData.get("beskrivelse") || "",
        type: formData.get("type") || "land",
        zone: formData.get("zone") || "",
        radius: parseNumberOrNull(formData.get("radius")),
        latitude: parseNumberOrNull(formData.get("latitude")),
        longitude: parseNumberOrNull(formData.get("longitude")),
        difficulty: formData.get("difficulty") || "",
        duration: formData.get("duration") || "",
        activationCondition:
            formData.get("activationCondition") || "",
        options: parseOptions(formData.get("options") || ""),
        activated: formData.get("activated") === "on",
        completed: formData.get("completed") === "on",
    };
}

// Event bindings

refreshBtn.addEventListener("click", async () => {
    allTasks = await fetchTasks();
    applyFilters();
});

exportBtn.addEventListener("click", async () => {
    try {
        const res = await fetch("/api/export", { method: "POST" });
        if (!res.ok) {
            throw new Error("Fejl ved eksport");
        }
        alert(
            "Eksporteret til JSON på serveren.\nURL: /exports/opgaver.json"
        );
        // Hvis du vil åbne filen i ny fane:
        // window.open("/exports/opgaver.json", "_blank");
    } catch (err) {
        console.error(err);
        alert("Kunne ikke eksportere til JSON");
    }
});

addTaskBtn.addEventListener("click", () => {
    openNewTaskModal();
});

// Table row edit handler
tasksTableBody.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    if (action === "edit") {
        const tr = e.target.closest("tr");
        const id = Number(tr.dataset.id);
        const task = allTasks.find((t) => t.id === id);
        if (!task) return;
        openEditDrawer(task);
    }
});

// Drawer events
closeEditDrawerBtn.addEventListener("click", closeEditDrawer);
editDrawerBackdrop.addEventListener("click", closeEditDrawer);
cancelEditBtn.addEventListener("click", closeEditDrawer);

editTaskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentEditTaskId) return;

    const payload = buildTaskPayloadFromForm(editTaskForm);

    try {
        await updateTask(currentEditTaskId, payload);
        closeEditDrawer();
        allTasks = await fetchTasks();
        applyFilters();
    } catch (err) {
        console.error(err);
        alert("Kunne ikke gemme ændringer");
    }
});

deleteTaskBtn.addEventListener("click", async () => {
    if (!currentEditTaskId) return;
    const ok = confirm(
        `Er du sikker på, at du vil slette opgave #${currentEditTaskId}?`
    );
    if (!ok) return;

    try {
        await deleteTask(currentEditTaskId);
        closeEditDrawer();
        allTasks = await fetchTasks();
        applyFilters();
    } catch (err) {
        console.error(err);
        alert("Kunne ikke slette opgave");
    }
});

// New task modal events
closeNewTaskBtn.addEventListener("click", closeNewTaskModal);
newTaskBackdrop.addEventListener("click", closeNewTaskModal);
cancelNewTaskBtn.addEventListener("click", closeNewTaskModal);

newTaskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = buildTaskPayloadFromForm(newTaskForm);

    try {
        await createTask(payload);
        closeNewTaskModal();
        allTasks = await fetchTasks();
        applyFilters();
    } catch (err) {
        console.error(err);
        alert("Kunne ikke oprette opgave");
    }
});

// Search/filter events
searchInput.addEventListener("input", () => {
    applyFilters();
});

filterType.addEventListener("change", () => {
    applyFilters();
});

// Init
(async function init() {
    initTheme();
    try {
        allTasks = await fetchTasks();
        applyFilters();
    } catch (err) {
        console.error(err);
        alert("Kunne ikke hente opgaver ved opstart");
    }
})();
