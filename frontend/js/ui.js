import { API_BASE_URL, authHeaders } from "./api.js";
import { getCurrentTasks } from "./tasks.js";

// =========================
// TOAST
// =========================

export function showToast(message, isError = false) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;

  toast.style.borderLeft = isError ? "4px solid #ef4444" : "4px solid #10b981";

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// =========================
// HELPERS
// =========================

export function resetForm(form) {
  form?.reset();
}

// =========================
// AUTH/DASHBOARD VIEWS
// =========================

export function showDashboard() {
  const authSection = document.getElementById("authSection");
  const dashboardSection = document.getElementById("dashboardSection");

  authSection?.classList.add("hidden");
  dashboardSection?.classList.remove("hidden");
}

export function showAuth() {
  const authSection = document.getElementById("authSection");
  const dashboardSection = document.getElementById("dashboardSection");

  dashboardSection?.classList.add("hidden");
  authSection?.classList.remove("hidden");
}

// =========================
// TASK RENDERING
// =========================

export function renderTasks(tasks) {
  const taskList = document.getElementById("taskList");

  if (!taskList) return;

  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;">
          No tasks found
        </td>
      </tr>
    `;
    return;
  }

  tasks.forEach((task) => {
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

export function updateStats(tasks) {
  const totalTasks = document.getElementById("totalTasks");
  const completedTasks = document.getElementById("completedTasks");
  const pendingTasks = document.getElementById("pendingTasks");

  if (totalTasks) {
    totalTasks.textContent = tasks.length;
  }

  if (completedTasks) {
    completedTasks.textContent = tasks.filter((t) => t.is_completed).length;
  }

  if (pendingTasks) {
    pendingTasks.textContent = tasks.filter((t) => !t.is_completed).length;
  }
}

// =========================
// MODAL
// =========================

export function openEditModal(id) {
  const task = getCurrentTasks().find((t) => t.id === id);

  if (!task) return;

  const editModal = document.getElementById("editModal");

  document.getElementById("editTaskId").value = task.id;
  document.getElementById("editTitle").value = task.title;
  document.getElementById("editDescription").value = task.description;
  document.getElementById("editPriority").value = task.priority;
  document.getElementById("editCompleted").checked = task.is_completed;

  editModal?.classList.remove("hidden");
}

export function initializeModal(loadTasks) {
  const editModal = document.getElementById("editModal");

  const closeBtn = document.getElementById("closeModalBtn");

  const editTaskForm = document.getElementById("editTaskForm");

  closeBtn?.addEventListener("click", () => {
    editModal?.classList.add("hidden");
  });

  editTaskForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const id = document.getElementById("editTaskId").value;

      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          title: document.getElementById("editTitle").value.trim(),
          description: document.getElementById("editDescription").value.trim(),
          is_completed: document.getElementById("editCompleted").checked,
          priority: Number(document.getElementById("editPriority").value),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Update failed");
      }

      editModal?.classList.add("hidden");

      showToast("Task updated");

      await loadTasks();
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

// Required because renderTasks()
// uses onclick="openEditModal(id)"
window.openEditModal = openEditModal;
