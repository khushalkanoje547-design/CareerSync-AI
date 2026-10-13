const API_BASE = "http://localhost:5000/api";
 
const content = document.getElementById("content");
const appsStat = document.getElementById("appsStat");
const filterBar = document.getElementById("filterBar");
 
let allItems = [];
let activeStatus = "all";
 
const TYPE_LABELS = {
  scholarship: "Scholarship",
  hackathon: "Hackathon",
  internship: "Internship",
  govt_scheme: "Govt Scheme",
  ideathon: "Ideathon"
};
 
const TYPE_ICONS = {
  scholarship: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/></svg>`,
  hackathon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 9-4 3 4 3"/><path d="m16 9 4 3-4 3"/><path d="m13 6-2 12"/></svg>`,
  internship: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  govt_scheme: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/></svg>`,
  ideathon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`
};
 
const ARROW_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>`;
const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const TRASH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>`;
 
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
 
function renderStats() {
  const savedCount = allItems.filter(i => i.status === "saved").length;
  const appliedCount = allItems.filter(i => i.status === "applied").length;
 
  if (allItems.length === 0) {
    appsStat.textContent = "Nothing saved yet";
    return;
  }
  appsStat.textContent = `${savedCount} saved · ${appliedCount} applied`;
}
 
function renderItems() {
  const filtered = activeStatus === "all" ? allItems : allItems.filter(i => i.status === activeStatus);
 
  if (filtered.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <p>${activeStatus === "all" ? "You haven't saved anything yet." : `No ${activeStatus} opportunities.`}</p>
        <p><a href="opportunities.html" class="details-link">Browse your matches ${ARROW_ICON}</a></p>
      </div>`;
    return;
  }
 
  const cards = filtered.map(item => {
    const { urgencyClass, urgencyText } = formatDeadline(item.deadline);
    const icon = TYPE_ICONS[item.type] || "";
    const isApplied = item.status === "applied";
 
    return `
      <div class="opp-card" data-type="${item.type}">
        <div class="opp-card-top">
          <span class="opp-type type-${item.type}">${icon}${TYPE_LABELS[item.type] || item.type}</span>
          <span class="match-score ${isApplied ? "score-high" : "score-mid"}">${isApplied ? CHECK_ICON + "Applied" : "Saved"}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.description || ""}</p>
        <div class="opp-deadline deadline-${urgencyClass}">${urgencyText}</div>
        <div class="opp-actions">
          <a href="${item.link}" target="_blank" rel="noopener" class="details-link">View details ${ARROW_ICON}</a>
          <div class="opp-actions-right">
            ${!isApplied ? `<button type="button" class="save-btn mark-applied-btn" data-opp-id="${item._id}">${CHECK_ICON}Mark as Applied</button>` : ""}
            <button type="button" class="save-btn remove-btn" data-opp-id="${item._id}">${TRASH_ICON}Remove</button>
          </div>
        </div>
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
    activeStatus = btn.dataset.status;
    renderItems();
  });
}
 
async function loadApplications() {
  const studentId = localStorage.getItem("studentId");
 
  if (!studentId) {
    content.innerHTML = `
      <div class="empty-state">
        <p>We couldn't find your profile.</p>
        <p><a href="profile.html" class="details-link">Fill it out again ${ARROW_ICON}</a></p>
      </div>`;
    appsStat.textContent = "";
    return;
  }
 
  try {
    const res = await fetch(`${API_BASE}/saved/${studentId}`);
    const data = await res.json();
 
    if (!res.ok) {
      throw new Error(data.error || "Something went wrong while loading your applications.");
    }
 
    allItems = data;
    renderStats();
    setupFilters();
    renderItems();
 
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
    appsStat.textContent = "";
  }
}
 
content.addEventListener("click", async (e) => {
  const studentId = localStorage.getItem("studentId");
  if (!studentId) return;
 
  const markBtn = e.target.closest(".mark-applied-btn");
  const removeBtn = e.target.closest(".remove-btn");
 
  if (markBtn) {
    const oppId = markBtn.dataset.oppId;
    markBtn.disabled = true;
    try {
      await fetch(`${API_BASE}/saved/${studentId}/${oppId}/applied`, { method: "PUT" });
      const item = allItems.find(i => i._id === oppId);
      if (item) item.status = "applied";
      renderStats();
      renderItems();
    } catch {
      markBtn.disabled = false;
    }
  }
 
  if (removeBtn) {
    const oppId = removeBtn.dataset.oppId;
    removeBtn.disabled = true;
    try {
      await fetch(`${API_BASE}/saved/${studentId}/${oppId}`, { method: "DELETE" });
      allItems = allItems.filter(i => i._id !== oppId);
      renderStats();
      renderItems();
    } catch {
      removeBtn.disabled = false;
    }
  }
});
 
loadApplications();
 