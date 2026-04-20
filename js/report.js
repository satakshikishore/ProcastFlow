// report.js — PCF Report (API version)

function formatReportDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", async () => {

  // Auth guard
  if (!sessionStorage.getItem("pcf_user")) {
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(sessionStorage.getItem("pcf_user"));

  // Element references — matches your existing HTML IDs
  const totalTasksEl    = document.getElementById("total-tasks");
  const completedStepsEl = document.getElementById("completed-steps");
  const completionRateEl = document.getElementById("completion-rate");
  const barEl           = document.getElementById("productivity-bar");
  const listEl          = document.getElementById("report-task-list");
  const insightEl       = document.getElementById("ai-insight");

  try {
    const res    = await fetch(`http://127.0.0.1:5000/api/report/${user.id}`);
    const report = await res.json();

    const completionRate = report.overall_completion_pct;

    if (totalTasksEl)    totalTasksEl.textContent    = report.total_tasks;
    if (completedStepsEl) completedStepsEl.textContent = report.completed_steps;
    if (completionRateEl) completionRateEl.textContent = completionRate + "%";
    if (barEl)           barEl.style.width            = completionRate + "%";

    // AI insight message
    if (insightEl) {
      let message = "";
      if (completionRate === 0)       message = "Ready to start? Begin with small steps to build momentum! 🚀";
      else if (completionRate < 50)   message = `You're ${completionRate}% productive today. Keep pushing forward! 💪`;
      else if (completionRate < 80)   message = `Great progress! You're ${completionRate}% done. Almost there! 🎯`;
      else                            message = `Excellent work! ${completionRate}% completion rate. You're crushing it! 🌟`;
      insightEl.innerHTML = `<h4>AI Insight</h4><p>${message}</p>`;
    }

    // Task list
    if (listEl) {
      if (!report.tasks.length) {
        listEl.innerHTML = '<div class="empty-state">No task history yet. Start with Task Breaker to generate reports.</div>';
        return;
      }
      listEl.innerHTML = report.tasks.map((task) => {
        return `<article class="task-item">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;">
            <h4>${escapeHtml(task.title)}</h4>
            <span class="badge">${task.completed_steps}/${task.total_steps} steps</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${task.completion_pct}%;"></div>
          </div>
          <p style="color:var(--text-muted);margin:0.75rem 0 0;">Created on ${formatReportDate(task.created_at)}</p>
        </article>`;
      }).join("");
    }

  } catch (err) {
    console.error("Failed to load report:", err);
    if (listEl) listEl.innerHTML = '<div class="empty-state">Failed to load report. Make sure the backend is running.</div>';
  }

});