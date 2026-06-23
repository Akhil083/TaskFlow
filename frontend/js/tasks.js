import { authHeaders } from "./api.js";
import { showToast, resetForm, renderTasks, updateStats } from "./ui.js";

const taskForm = document.getElementById("taskForm");

let currentPage = 1;
let limit = 10;
let currentTasks = [];

export function getCurrentTasks() {
  return currentTasks;
}

export function clearTasks() {
  currentTasks = [];

  const taskList = document.getElementById("taskList");

  if (taskList) {
    taskList.innerHTML = "";
  }

  updateStats([]);
}

export async function loadTasks() {
  try {
    const title = document.getElementById("searchInput").value;

    const status = document.getElementById("statusFilter").value;

    const sortBy = document.getElementById("sortBy").value;

    const orderBy = document.getElementById("orderBy").value;

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

    const response = await fetch(`/tasks?${params}`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    currentTasks = await response.json();

    renderTasks(currentTasks);
    updateStats(currentTasks);

    document.getElementById("pageInfo").textContent = `Page ${currentPage}`;
  } catch (error) {
    showToast(error.message, true);
  }
}

export async function completeTask(id) {
  try {
    const response = await fetch(`/tasks/${id}/complete`, {
      method: "PATCH",
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed");
    }

    showToast("Task completed");

    await loadTasks();
  } catch (error) {
    showToast(error.message, true);
  }
}

export async function deleteTask(id) {
  if (!confirm("Delete task?")) return;

  try {
    const response = await fetch(`/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    showToast("Task deleted");

    await loadTasks();
  } catch (error) {
    showToast(error.message, true);
  }
}

export function initializeTaskEvents() {
  const taskForm = document.getElementById("taskForm");

  taskForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: document.getElementById("taskTitle").value.trim(),
          description: document.getElementById("taskDescription").value.trim(),
          is_completed: document.getElementById("taskCompleted").checked,
          priority: Number(document.getElementById("taskPriority").value),
        }),
      });

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

  document.getElementById("applyFiltersBtn")?.addEventListener("click", () => {
    currentPage = 1;
    loadTasks();
  });

  document.getElementById("clearFiltersBtn")?.addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("statusFilter").value = "";
    document.getElementById("sortBy").value = "id";
    document.getElementById("orderBy").value = "desc";

    currentPage = 1;

    loadTasks();
  });

  document.getElementById("nextBtn")?.addEventListener("click", async () => {
    currentPage++;

    await loadTasks();

    if (currentTasks.length === 0) {
      currentPage--;

      await loadTasks();
    }
  });

  document.getElementById("prevBtn")?.addEventListener("click", async () => {
    if (currentPage > 1) {
      currentPage--;

      await loadTasks();
    }
  });
}

window.completeTask = completeTask;
window.deleteTask = deleteTask;
