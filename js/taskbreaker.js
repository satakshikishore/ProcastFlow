// taskbreaker.js — PCF Task Breaker (AI chat version)

document.addEventListener("DOMContentLoaded", () => {

  if (!sessionStorage.getItem("pcf_user")) {
    window.location.href = "login.html";
    return;
  }

  const user         = JSON.parse(sessionStorage.getItem("pcf_user"));
  const chatForm     = document.getElementById("chat-form");
  const chatInput    = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  // ── Add message with avatar ──────────────────────────────────
  function addMessage(contentHtml, role = "ai") {
    const wrapper = document.createElement("div");
    wrapper.className = `chat-message ${role}`;

    const avatar = document.createElement("div");
    avatar.className = `avatar ${role}`;
    avatar.textContent = role === "ai" ? "AI" : (user.email ? user.email[0].toUpperCase() : "U");

    const bubble = document.createElement("div");
    bubble.className = `bubble ${role}`;
    bubble.innerHTML = contentHtml;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return wrapper;
  }

  // ── Typing indicator (3 dots) ────────────────────────────────
  function showTyping() {
    const wrapper = document.createElement("div");
    wrapper.className = "chat-message ai";

    const avatar = document.createElement("div");
    avatar.className = "avatar ai";
    avatar.textContent = "AI";

    const bubble = document.createElement("div");
    bubble.className = "bubble ai typing-bubble";
    bubble.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return wrapper;
  }

  // ── Render AI steps ──────────────────────────────────────────
  function renderResult(result) {
    const stepsHtml = result.steps.map((s, i) => `
      <div class="step-row">
        <span class="step-num">${i + 1}</span>
        <span>${s}</span>
      </div>`).join("");

    const savedHtml = result.task_id
      ? `<div class="saved-badge">✓ Saved to your TODO list</div>`
      : "";

    addMessage(`
      <div class="task-title-badge">✦ ${result.title}</div>
      ${stepsHtml}
      ${savedHtml}
    `, "ai");
  }

  // ── Welcome message ──────────────────────────────────────────
  addMessage(`
    <strong>Hello! I'm your AI productivity assistant.</strong><br/><br/>
    Tell me any task you're working on and I'll break it down into clear, 
    beginner-friendly steps so you can start immediately.<br/><br/>
    <em style="color:var(--text-muted);font-size:0.88rem;">Try: "Build a mobile app" or "Plan a marketing campaign"</em>
  `, "ai");

  // ── Submit ───────────────────────────────────────────────────
  if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const taskTitle = chatInput ? chatInput.value.trim() : "";
      if (!taskTitle) return;

      addMessage(taskTitle, "user");
      chatInput.value = "";
      chatInput.disabled = true;

      const typingEl = showTyping();

      try {
        const res = await fetch("http://127.0.0.1:5000/api/ai/task-break", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ task: taskTitle, user_id: user.id }),
        });
        const result = await res.json();
        typingEl.remove();
        if (!res.ok) throw new Error(result.error || "Request failed");
        renderResult(result);
      } catch (err) {
        typingEl.remove();
        addMessage(`<span style="color:#c0392b;">⚠ ${err.message || "Failed to reach backend. Is Flask running?"}</span>`, "ai");
      } finally {
        chatInput.disabled = false;
        chatInput.focus();
      }
    });
  }
});