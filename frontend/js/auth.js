import { getToken, loginUser, registerUser, getCurrentUser } from "./api.js";

import { showAuth, showDashboard, showToast, resetForm } from "./ui.js";

import { loadTasks, clearTasks } from "./tasks.js";

// =========================
// USER LOADING
// =========================

export async function loadUser() {
  try {
    const user = await getCurrentUser();

    document.getElementById("userName").textContent = user.user_name;

    document.getElementById("userEmail").textContent = user.email;
  } catch {
    logout();
  }
}

// =========================
// LOGOUT
// =========================

export function logout() {
  localStorage.removeItem("token");

  showAuth();

  clearTasks();

  showToast("Logged out");
}

// =========================
// AUTO LOGIN
// =========================

export async function autoLogin() {
  const token = getToken();

  if (!token) return;

  try {
    await loadUser();

    showDashboard();

    await loadTasks();
  } catch {
    logout();
  }
}

// =========================
// AUTH INITIALIZATION
// =========================

export function initializeAuth() {
  const loginTab = document.getElementById("loginTab");

  const registerTab = document.getElementById("registerTab");

  const loginForm = document.getElementById("loginForm");

  const registerForm = document.getElementById("registerForm");

  const logoutBtn = document.getElementById("logoutBtn");

  // -------------------------
  // Logout
  // -------------------------

  logoutBtn?.addEventListener("click", logout);

  // -------------------------
  // Tab Switching
  // -------------------------

  loginTab?.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  });

  registerTab?.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });

  // -------------------------
  // Register
  // -------------------------

  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await registerUser({
        user_name: document.getElementById("registerUsername").value.trim(),

        email: document.getElementById("registerEmail").value.trim(),

        password: document.getElementById("registerPassword").value,
      });

      showToast("Registration successful");

      resetForm(registerForm);

      loginTab.click();
    } catch (error) {
      showToast(error.message, true);
    }
  });

  // -------------------------
  // Login
  // -------------------------

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(
        document.getElementById("loginUsername").value.trim(),

        document.getElementById("loginPassword").value,
      );

      localStorage.setItem("token", data.access_token);

      resetForm(loginForm);

      await loadUser();

      showDashboard();

      await loadTasks();

      showToast("Login successful");
    } catch (error) {
      showToast(error.message, true);
    }
  });
}
