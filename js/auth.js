// auth.js — PCF Authentication (API version)

document.addEventListener("DOMContentLoaded", () => {

  // ── Auth guard ───────────────────────────────────────────────
  const authRequired = document.body.dataset.authRequired === "true";
  if (authRequired && !sessionStorage.getItem("pcf_user")) {
    window.location.href = "login.html";
    return;
  }

  // ── Login form ───────────────────────────────────────────────
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    if (sessionStorage.getItem("pcf_user")) {
      window.location.href = "dashboard.html";
      return;
    }
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email    = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const msg      = document.getElementById("login-message");
      if (!email || !password) {
        if (msg) { msg.style.color = "red"; msg.textContent = "Please enter both email and password."; }
        return;
      }
      if (msg) { msg.style.color = ""; msg.textContent = "Logging in..."; }
      try {
        const res  = await fetch("http://127.0.0.1:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        sessionStorage.setItem("pcf_user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
      } catch (err) {
        if (msg) { msg.style.color = "red"; msg.textContent = err.message || "Login failed."; }
      }
    });
  }

  // ── Register form ────────────────────────────────────────────
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email    = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const msg      = document.getElementById("register-message") || document.getElementById("login-message");
      if (msg) { msg.style.color = ""; msg.textContent = "Creating account..."; }
      try {
        const res  = await fetch("http://127.0.0.1:5000/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        sessionStorage.setItem("pcf_user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
      } catch (err) {
        if (msg) { msg.style.color = "red"; msg.textContent = err.message || "Registration failed."; }
      }
    });
  }

  // ── Logout button ────────────────────────────────────────────
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.removeItem("pcf_user");
      window.location.href = "login.html";
    });
  }

});