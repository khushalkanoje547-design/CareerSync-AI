const API_BASE = "http://localhost:5000/api";

const content = document.getElementById("content");
const oppsStat = document.getElementById("oppsStat");
const filterBar = document.getElementById("filterBar");

let allOpportunities = [];
let activeFilter = "all";

const TYPE_LABELS = {
  scholarship: "Scholarship",
  hackathon: "Hackathon",
  internship: "Internship",
  govt_scheme: "Govt Scheme"
};

const TYPE_ICONS = {
  scholarship: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/></svg>`,
  hackathon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 9-4 3 4 3"/><path d="m16 9 4 3-4 3"/><path d="m13 6-2 12"/></svg>`,
  internship: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  govt_scheme: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/></svg>`
};

function daysLeft(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
}

function formatDeadline(dateStr) {
  const date = new Date(dateStr);
  const formatted = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const left = daysLeft(dateStr);

  let urgencyClass = "normal";
  let urgencyText = formatted;

  if (left <= 3) {
    urgencyClass = "urgent";
    urgencyText = `${formatted} — ${left <= 0 ? "closing today" : left + " day" + (left === 1 ? "" : "s") + " left"}`;
  } else if (left <= 7) {
    urgencyClass = "soon";
    urgencyText = `${formatted} — ${left} days left`;
  }

  return { urgencyClass, urgencyText };
}

function renderStats(opportunities) {
  if (opportunities.length === 0) {
    oppsStat.textContent = "No matches yet";
    return;
  }
  const closingSoon = opportunities.filter(o => daysLeft(o.deadline) <= 7).length;
  let text = `${opportunities.length} opportunit${opportunities.length === 1 ? "y" : "ies"} matched`;
  if (closingSoon > 0) {
    text += ` · ${closingSoon} closing within a week`;
  }
  oppsStat.textContent = text;
}

function renderOpportunities() {
  const filtered = activeFilter === "all"
    ? allOpportunities
    : allOpportunities.filter(o => o.type === activeFilter);

  if (filtered.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <p>No ${activeFilter === "all" ? "" : TYPE_LABELS[activeFilter].toLowerCase() + " "}opportunities match right now.</p>
        <p class="empty-sub">Check back soon — new ones are added regularly.</p>
      </div>`;
    return;
  }

  const cards = filtered.map(opp => {
    const { urgencyClass, urgencyText } = formatDeadline(opp.deadline);
    const icon = TYPE_ICONS[opp.type] || "";
    return `
      <div class="opp-card" data-type="${opp.type}">
        <span class="opp-type type-${opp.type}">${icon}${TYPE_LABELS[opp.type] || opp.type}</span>
        <h3>${opp.title}</h3>
        <p>${opp.description || ""}</p>
        <div class="opp-deadline deadline-${urgencyClass}">${urgencyText}</div>
        <a href="${opp.link}" target="_blank" rel="noopener">View details</a>
      </div>
    `;
  }).join("");

  content.innerHTML = `<div class="opp-grid">${cards}</div>`;
}

function setupFilters() {
  filterBar.hidden = false;
  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-pill");
    if (!btn) return;

    filterBar.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.type;
    renderOpportunities();
  });
}

async function loadOpportunities() {
  const studentId = localStorage.getItem("studentId");

  if (!studentId) {
    content.innerHTML = `
      <div class="empty-state">
        <p>We couldn't find your profile.</p>
        <p class="empty-sub"><a href="index.html">Fill it out again</a></p>
      </div>`;
    oppsStat.textContent = "";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/opportunities/match/${studentId}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong while fetching matches.");
    }

    allOpportunities = data;
    renderStats(data);
    setupFilters();
    renderOpportunities();

  } catch (err) {
    content.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
    oppsStat.textContent = "";
  }
}

loadOpportunities();
