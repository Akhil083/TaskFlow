// =========================
// CONFIG
// =========================

const API_BASE_URL = "http://127.0.0.1:8000";

let currentPage = 1;
let limit = 10;
let currentTasks = [];

// =========================
// DOM ELEMENTS
// =========================

const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

const editModal = document.getElementById("editModal");
const editTaskForm = document.getElementById("editTaskForm");

const toast = document.getElementById("toast");

// =========================
// HELPERS
// =========================

function getToken() {
    return localStorage.getItem("token");
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}

function showToast(message, isError = false) {
    toast.textContent = message;

    toast.style.borderLeft = isError
        ? "4px solid #ef4444"
        : "4px solid #10b981";

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function resetForm(form) {
    form.reset();
}

function showDashboard() {
    authSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
}

function showAuth() {
    dashboardSection.classList.add("hidden");
    authSection.classList.remove("hidden");
}

// =========================
// TAB SWITCHING
// =========================

loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
});

registerTab.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
});

// =========================
// REGISTER
// =========================

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        const response = await fetch(
            `${API_BASE_URL}/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_name:
                        document.getElementById("registerUsername").value.trim(),

                    email:
                        document.getElementById("registerEmail").value.trim(),

                    password:
                        document.getElementById("registerPassword").value
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Registration failed");
        }

        showToast("Registration successful");

        resetForm(registerForm);

        loginTab.click();

    } catch (error) {
        showToast(error.message, true);
    }
});

// =========================
// LOGIN
// =========================

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {

        const formData = new URLSearchParams();

        formData.append(
            "username",
            document.getElementById("loginUsername").value.trim()
        );

        formData.append(
            "password",
            document.getElementById("loginPassword").value
        );

        const response = await fetch(
            `${API_BASE_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Login failed");
        }

        localStorage.setItem(
            "token",
            data.access_token
        );

        resetForm(loginForm);

        await loadUser();
        await loadTasks();

        showDashboard();

        showToast("Login successful");

    } catch (error) {
        showToast(error.message, true);
    }
});

// =========================
// LOAD USER
// =========================

async function loadUser() {

    const response = await fetch(
        `${API_BASE_URL}/auth/me`,
        {
            headers: authHeaders()
        }
    );

    if (!response.ok) {
        logout();
        return;
    }

    const user = await response.json();

    document.getElementById("userName").textContent =
        user.user_name;

    document.getElementById("userEmail").textContent =
        user.email;
}

// =========================
// LOGOUT
// =========================

document
    .getElementById("logoutBtn")
    .addEventListener("click", logout);

function logout() {

    localStorage.removeItem("token");

    showAuth();

    currentTasks = [];
    taskList.innerHTML = "";

    showToast("Logged out");
}

// =========================
// CREATE TASK
// =========================

taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {

        const response = await fetch(
            `${API_BASE_URL}/tasks`,
            {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    title:
                        document.getElementById("taskTitle").value.trim(),

                    description:
                        document.getElementById("taskDescription").value.trim(),

                    is_completed:
                        document.getElementById("taskCompleted").checked,

                    priority:
                        Number(
                            document.getElementById("taskPriority").value
                        )
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed");
        }

        resetForm(taskForm);

        document.getElementById("taskPriority").value = "3";

        showToast("Task created");

        await loadTasks();

    } catch (error) {
        showToast(error.message, true);
    }
});

// =========================
// TASKS
// =========================

async function loadTasks() {

    try {

        const title =
            document.getElementById("searchInput").value;

        const status =
            document.getElementById("statusFilter").value;

        const sortBy =
            document.getElementById("sortBy").value;

        const orderBy =
            document.getElementById("orderBy").value;

        const params = new URLSearchParams();

        params.append("limit", limit);
        params.append("skip", (currentPage - 1) * limit);
        params.append("sort_by", sortBy);
        params.append("order_by", orderBy);

        if (title) {
            params.append("title", title);
        }

        if (status !== "") {
            params.append("is_completed", status);
        }

        const response = await fetch(
            `${API_BASE_URL}/tasks?${params}`,
            {
                headers: authHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch tasks");
        }

        currentTasks = await response.json();

        renderTasks();
        updateStats();

        document.getElementById(
            "pageInfo"
        ).textContent = `Page ${currentPage}`;

    } catch (error) {
        showToast(error.message, true);
    }
}

// =========================
// RENDER TASKS
// =========================

function renderTasks() {

    taskList.innerHTML = "";

    if (currentTasks.length === 0) {

        taskList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No tasks found
                </td>
            </tr>
        `;

        return;
    }

    currentTasks.forEach(task => {

        const statusBadge = task.is_completed
            ? `<span class="status-complete">Completed</span>`
            : `<span class="status-pending">Pending</span>`;

        const actions = task.is_completed
            ? `
                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>
            `
            : `
                <button
                    class="edit-btn"
                    onclick="openEditModal(${task.id})"
                >
                    Edit
                </button>

                <button
                    class="complete-btn"
                    onclick="completeTask(${task.id})"
                >
                    Complete
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>
            `;

        taskList.innerHTML += `
            <tr>
                <td>${task.id}</td>

                <td>
                    <span class="priority-badge priority-${task.priority}">
                        P${task.priority}
                    </span>
                </td>

                <td>${task.title}</td>

                <td>${task.description}</td>

                <td>${statusBadge}</td>

                <td>
                    <div class="action-buttons">
                        ${actions}
                    </div>
                </td>
            </tr>
        `;
    });
}

// =========================
// STATS
// =========================

function updateStats() {

    document.getElementById("totalTasks").textContent =
        currentTasks.length;

    document.getElementById("completedTasks").textContent =
        currentTasks.filter(t => t.is_completed).length;

    document.getElementById("pendingTasks").textContent =
        currentTasks.filter(t => !t.is_completed).length;
}

// =========================
// COMPLETE TASK
// =========================

async function completeTask(id) {

    try {

        const response = await fetch(
            `${API_BASE_URL}/tasks/${id}/complete`,
            {
                method: "PATCH",
                headers: authHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Failed");
        }

        showToast("Task completed");

        await loadTasks();

    } catch (error) {
        showToast(error.message, true);
    }
}

// =========================
// DELETE TASK
// =========================

async function deleteTask(id) {

    if (!confirm("Delete task?")) return;

    try {

        const response = await fetch(
            `${API_BASE_URL}/tasks/${id}`,
            {
                method: "DELETE",
                headers: authHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        showToast("Task deleted");

        await loadTasks();

    } catch (error) {
        showToast(error.message, true);
    }
}

// =========================
// EDIT MODAL
// =========================

function openEditModal(id) {

    const task = currentTasks.find(
        t => t.id === id
    );

    if (!task) return;

    document.getElementById("editTaskId").value =
        task.id;

    document.getElementById("editTitle").value =
        task.title;

    document.getElementById("editDescription").value =
        task.description;

    document.getElementById("editPriority").value =
        task.priority;

    document.getElementById("editCompleted").checked =
        task.is_completed;

    editModal.classList.remove("hidden");
}

document
    .getElementById("closeModalBtn")
    .addEventListener("click", () => {
        editModal.classList.add("hidden");
    });

editTaskForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const id =
            document.getElementById("editTaskId").value;

        const response = await fetch(
            `${API_BASE_URL}/tasks/${id}`,
            {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify({
                    title:
                        document.getElementById("editTitle").value.trim(),

                    description:
                        document.getElementById("editDescription").value.trim(),

                    is_completed:
                        document.getElementById("editCompleted").checked,

                    priority:
                        Number(
                            document.getElementById("editPriority").value
                        )
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Update failed");
        }

        editModal.classList.add("hidden");

        showToast("Task updated");

        await loadTasks();

    } catch (error) {
        showToast(error.message, true);
    }
});

// =========================
// FILTERS
// =========================

document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", () => {

        currentPage = 1;
        loadTasks();
    });

document
    .getElementById("clearFiltersBtn")
    .addEventListener("click", () => {

        document.getElementById("searchInput").value = "";
        document.getElementById("statusFilter").value = "";
        document.getElementById("sortBy").value = "id";
        document.getElementById("orderBy").value = "desc";

        currentPage = 1;

        loadTasks();
    });

// =========================
// PAGINATION
// =========================

document
    .getElementById("nextBtn")
    .addEventListener("click", async () => {

        currentPage++;

        await loadTasks();

        if (currentTasks.length === 0) {
            currentPage--;
            await loadTasks();
        }
    });

document
    .getElementById("prevBtn")
    .addEventListener("click", async () => {

        if (currentPage > 1) {
            currentPage--;
            await loadTasks();
        }
    });

// =========================
// AUTO LOGIN
// =========================

window.addEventListener("DOMContentLoaded", async () => {

    const token = getToken();

    if (!token) return;

    try {

        await loadUser();

        showDashboard();

        await loadTasks();

    } catch {

        logout();
    }
});