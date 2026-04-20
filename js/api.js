// ─────────────────────────────────────────────────────────────
// api.js — Centralized API helper for ProcastFlow (PCF)
// Replace localStorage references with these functions
// ─────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:5000/api";

// ── Helpers ───────────────────────────────────────────────────

function getUser() {
  const raw = sessionStorage.getItem("pcf_user");
  return raw ? JSON.parse(raw) : null;
}

function setUser(user) {
  sessionStorage.setItem("pcf_user", JSON.stringify(user));
}

function clearUser() {
  sessionStorage.removeItem("pcf_user");
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data;
}

// ── Auth ──────────────────────────────────────────────────────

async function register(email, password) {
  const data = await apiFetch("/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setUser(data.user);
  return data.user;
}

async function login(email, password) {
  const data = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setUser(data.user);
  return data.user;
}

function logout() {
  clearUser();
  window.location.href = "index.html"; // adjust to your login page
}

// ── AI Task Breaker ───────────────────────────────────────────

/**
 * Call AI to break a task into steps.
 * If save=true and user is logged in, auto-saves to DB.
 * Returns: { title, steps, task_id? }
 */
async function breakTask(taskTitle, save = true) {
  const user = getUser();
  const payload = { task: taskTitle };
  if (save && user) payload.user_id = user.id;

  return await apiFetch("/ai/task-break", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Tasks & Steps ─────────────────────────────────────────────

async function getTasks() {
  const user = getUser();
  if (!user) throw new Error("Not logged in");
  return await apiFetch(`/tasks/${user.id}`);
}

async function createTask(title, steps = []) {
  const user = getUser();
  if (!user) throw new Error("Not logged in");
  return await apiFetch("/tasks", {
    method: "POST",
    body: JSON.stringify({ user_id: user.id, title, steps }),
  });
}

async function toggleStep(taskId, stepId, isCompleted) {
  return await apiFetch(`/tasks/${taskId}/steps/${stepId}`, {
    method: "PUT",
    body: JSON.stringify({ is_completed: isCompleted }),
  });
}

async function deleteTask(taskId) {
  return await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
}

// ── Report ────────────────────────────────────────────────────

async function getReport() {
  const user = getUser();
  if (!user) throw new Error("Not logged in");
  return await apiFetch(`/report/${user.id}`);
}