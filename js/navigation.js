// navigation.js — PCF Navigation (API version)

async function renderDashboardOverview() {
  const summaryElement = document.getElementById("dashboard-summary");
  if (!summaryElement) return;

  const userRaw = sessionStorage.getItem("pcf_user");
  if (!userRaw) return;
  const user = JSON.parse(userRaw);

  try {
    const res = await fetch(`http://127.0.0.1:5000/api/report/${user.id}`);
    const report = await res.json();

    const cards = [
      { title: "Total tasks",      value: report.total_tasks },
      { title: "Steps completed",  value: report.completed_steps },
      { title: "Productivity",     value: report.overall_completion_pct + "%" },
    ];

    summaryElement.innerHTML = "";
    cards.forEach((item) => {
      const card = document.createElement("div");
      card.className = "metric-card";
      card.innerHTML = `<h3>${item.title}</h3><strong>${item.value}</strong>`;
      summaryElement.appendChild(card);
    });
  } catch (err) {
    console.error("Dashboard overview failed:", err);
  }
}

function highlightNavigationLinks() {
  const activePage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-links a, .sidebar a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === activePage || (href === "home.html" && activePage === "")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  highlightNavigationLinks();
  renderDashboardOverview();
});