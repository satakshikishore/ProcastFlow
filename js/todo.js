// todo.js — PCF TODO (API version)

document.addEventListener("DOMContentLoaded", async () => {

  if (!sessionStorage.getItem("pcf_user")) {
    window.location.href = "login.html";
    return;
  }

  const user      = JSON.parse(sessionStorage.getItem("pcf_user"));
  const container = document.getElementById("todo-container");

  async function loadTasks() {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/tasks/${user.id}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const tasks = await res.json();
      renderTasks(tasks);
    } catch (err) {
      console.error("TODO fetch error:", err);
      if (container) container.innerHTML = `
        <div class="empty-state">
          ⚠ Failed to load tasks.<br/>
          <small style="color:var(--text-muted)">Make sure Flask is running on port 5000 and you are logged in.</small>
        </div>`;
    }
  }

  function renderTasks(tasks) {
    if (!container) return;
    container.innerHTML = "";

    if (!tasks.length) {
      container.innerHTML = '<div class="empty-state">No tasks yet. Use Task Breaker to create your first task!</div>';
      return;
    }

    tasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "calendar-card";

      // Header
      const header = document.createElement("div");
      header.className = "calendar-header";

      const titleEl = document.createElement("h4");
      titleEl.textContent = task.title;

      const actions = document.createElement("div");
      actions.className = "header-actions";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑";
      deleteBtn.className = "delete-icon";
      deleteBtn.title = "Delete task";
      deleteBtn.addEventListener("click", async () => {
        if (!confirm(`Delete "${task.title}"?`)) return;
        try {
          await fetch(`http://127.0.0.1:5000/api/tasks/${task.id}`, { method: "DELETE" });
          card.remove();
          if (!container.querySelector(".calendar-card")) {
            container.innerHTML = '<div class="empty-state">No tasks yet. Use Task Breaker to create your first task!</div>';
          }
        } catch (err) { alert("Failed to delete task."); }
      });

      actions.appendChild(deleteBtn);
      header.appendChild(titleEl);
      header.appendChild(actions);
      card.appendChild(header);

      // Progress
      const total     = task.steps.length;
      const completed = task.steps.filter(s => s.is_completed).length;
      const pct       = total ? Math.round((completed / total) * 100) : 0;

      const progressWrap = document.createElement("div");
      progressWrap.className = "progress-bar";
      progressWrap.style.marginBottom = "0.5rem";
      const progressFill = document.createElement("div");
      progressFill.className = "progress-fill";
      progressFill.style.width = pct + "%";
      progressWrap.appendChild(progressFill);
      card.appendChild(progressWrap);

      const status = document.createElement("span");
      status.className = "task-status " + (pct === 0 ? "not-started" : pct === 100 ? "completed" : "in-progress");
      status.textContent = pct === 0 ? "Not started" : pct === 100 ? "Completed ✓" : `In progress (${pct}%)`;
      card.appendChild(status);

      // Steps
      const ul = document.createElement("ul");
      ul.style.cssText = "list-style:none;padding:0.75rem 0 0;margin:0;display:grid;gap:0.5rem;";

      task.steps.forEach((step) => {
        const li = document.createElement("li");
        li.className = "step-item" + (step.is_completed ? " completed" : "");

        const checkbox = document.createElement("input");
        checkbox.type    = "checkbox";
        checkbox.checked = step.is_completed;

        checkbox.addEventListener("change", async () => {
          try {
            await fetch(`http://127.0.0.1:5000/api/tasks/${task.id}/steps/${step.id}`, {
              method:  "PUT",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ is_completed: checkbox.checked }),
            });
            li.className = "step-item" + (checkbox.checked ? " completed" : "");
            const allBoxes  = [...card.querySelectorAll("input[type=checkbox]")];
            const doneCount = allBoxes.filter(b => b.checked).length;
            const newPct    = Math.round((doneCount / allBoxes.length) * 100);
            progressFill.style.width = newPct + "%";
            status.className = "task-status " + (newPct === 0 ? "not-started" : newPct === 100 ? "completed" : "in-progress");
            status.textContent = newPct === 0 ? "Not started" : newPct === 100 ? "Completed ✓" : `In progress (${newPct}%)`;
          } catch (err) {
            checkbox.checked = !checkbox.checked;
            alert("Failed to update step.");
          }
        });

        const label = document.createElement("span");
        label.textContent = step.step_text;
        li.appendChild(checkbox);
        li.appendChild(label);
        ul.appendChild(li);
      });

      card.appendChild(ul);
      container.appendChild(card);
    });
  }

  await loadTasks();
});