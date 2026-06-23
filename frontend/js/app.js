import { initializeAuth, autoLogin } from "./auth.js";

import { initializeTaskEvents, loadTasks } from "./tasks.js";

import { initializeModal } from "./ui.js";

async function loadComponent(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return await response.text();
}

async function initializeApp() {
  const app = document.getElementById("app");

  const auth = await loadComponent("/static/pages/auth.html");

  const dashboard = await loadComponent("/static/pages/dashboard.html");

  const modal = await loadComponent("/static/pages/edit-modal.html");

  app.innerHTML = auth + dashboard + modal;

  initializeAuth();

  initializeTaskEvents();

  initializeModal(loadTasks);

  await autoLogin();
}

initializeApp();
