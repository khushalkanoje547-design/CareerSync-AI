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
const SPARK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`;
 
// Read ?type= from the URL (set by nav links on the landing page) so the
// matching filter is pre-selected when the page loads.
const urlParams = new URLSearchParams(window.location.search);
const requestedType = urlParams.get("type");
if (requestedType && TYPE_LABELS[requestedType]) {
  activeFilter = requestedType;
}
 
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
 
function scoreBadge(score) {
  if (score === null || score === undefined) return "";
  let tone = "score-low";
  if (score >= 75) tone = "score-high";
  else if (score >= 45) tone = "score-mid";
  return `<span class="match-score ${tone}">${SPARK_ICON}${score}% match</span>`;
}
 
function renderOpportunities() {
  const filtered = activeFilter === "all"
    ? allOpportunities
    : allOpportunities.filter(o => o.type === activeFilter);
 
  if (filtered.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <p>No ${activeFilter === "all" ? "" : TYPE_LABELS[activeFilter].toLowerCase() + " "}opportunities match right now.</p>
        <p>Check back soon — new ones are added regularly.</p>
      </div>`;
    return;
  }
 
  const cards = filtered.map(opp => {
    const { urgencyClass, urgencyText } = formatDeadline(opp.deadline);
    const icon = TYPE_ICONS[opp.type] || "";
    return `
      <div class="opp-card" data-type="${opp.type}">
        <div class="opp-card-top">
          <span class="opp-type type-${opp.type}">${icon}${TYPE_LABELS[opp.type] || opp.type}</span>
          ${scoreBadge(opp.matchScore)}
        </div>
        <h3>${opp.title}</h3>
        <p>${opp.description || ""}</p>
        ${opp.matchReason ? `<p class="match-reason">${SPARK_ICON}${opp.matchReason}</p>` : ""}
        <div class="opp-deadline deadline-${urgencyClass}">${urgencyText}</div>
        <div class="opp-actions">
          <a href="${opp.link}" target="_blank" rel="noopener" class="details-link">View details ${ARROW_ICON}</a>
          <button type="button" class="draft-btn" data-opp-id="${opp._id}">${SPARK_ICON}Generate Draft</button>
        </div>
      </div>
    `;
  }).join("");
 
  content.innerHTML = `<div class="opp-grid">${cards}</div>`;
}
 
function setupFilters() {
  filterBar.hidden = false;
 
  filterBar.querySelectorAll(".filter-pill").forEach(p => {
    p.classList.toggle("active", p.dataset.type === activeFilter);
  });
 
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
        <p><a href="profile.html" class="details-link">Fill it out again ${ARROW_ICON}</a></p>
      </div>`;
    oppsStat.textContent = "";
    return;
  }
 
  // The first load for a student calls Gemini and can take a few seconds —
  // subsequent loads hit the cache and are instant, but the message stays
  // honest either way since we can't tell in advance.
  content.innerHTML = `<div class="loading">Analysing your profile against eligible opportunities…</div>`;
 
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
 
// ---------- Draft generation ----------
 
const draftOverlay = document.createElement("div");
draftOverlay.className = "draft-overlay";
draftOverlay.hidden = true;
draftOverlay.innerHTML = `
  <div class="draft-panel">
    <div class="draft-panel-head">
      <p>Your draft</p>
      <button type="button" class="draft-close" aria-label="Close">&times;</button>
    </div>
    <p class="draft-disclaimer">${SPARK_ICON}AI-generated first draft — review and personalize before submitting.</p>
    <div class="draft-body">
      <div class="loading">Writing your draft…</div>
    </div>
    <div class="draft-panel-actions">
      <button type="button" class="btn btn-outline draft-copy">Copy</button>
      <button type="button" class="btn btn-outline draft-regenerate">Regenerate</button>
    </div>
  </div>
`;
document.body.appendChild(draftOverlay);
 
const draftBody = draftOverlay.querySelector(".draft-body");
const draftCopyBtn = draftOverlay.querySelector(".draft-copy");
const draftRegenerateBtn = draftOverlay.querySelector(".draft-regenerate");
let currentDraftOppId = null;
 
function closeDraftOverlay() {
  draftOverlay.hidden = true;
}
 
draftOverlay.querySelector(".draft-close").addEventListener("click", closeDraftOverlay);
draftOverlay.addEventListener("click", (e) => {
  if (e.target === draftOverlay) closeDraftOverlay();
});
 
function renderDraftText(text) {
  draftBody.innerHTML = `<textarea class="draft-textarea" rows="10">${text}</textarea>`;
}
 
function renderDraftError(message) {
  draftBody.innerHTML = `<div class="empty-state"><p>${message}</p></div>`;
}
 
async function fetchDraft(studentId, opportunityId, { regenerate = false } = {}) {
  draftBody.innerHTML = `<div class="loading">${regenerate ? "Regenerating your draft…" : "Writing your draft…"}</div>`;
  draftCopyBtn.disabled = true;
  draftRegenerateBtn.disabled = true;
 
  const url = `${API_BASE}/drafts/${studentId}/${opportunityId}${regenerate ? "/regenerate" : ""}`;
  try {
    const res = await fetch(url, { method: "POST" });
    const data = await res.json();
 
    if (!res.ok) {
      throw new Error(data.error || "Could not generate a draft right now.");
    }
 
    renderDraftText(data.draftText);
  } catch (err) {
    renderDraftError(err.message);
  } finally {
    draftCopyBtn.disabled = false;
    draftRegenerateBtn.disabled = false;
  }
}
 
content.addEventListener("click", (e) => {
  const btn = e.target.closest(".draft-btn");
  if (!btn) return;
 
  const studentId = localStorage.getItem("studentId");
  if (!studentId) return;
 
  currentDraftOppId = btn.dataset.oppId;
  draftOverlay.hidden = false;
 
  const resumeWarning = draftOverlay.querySelector(".draft-resume-warning");
  if (resumeWarning) resumeWarning.remove();
 
  if (localStorage.getItem("hasResume") === "0") {
    const warning = document.createElement("p");
    warning.className = "draft-resume-warning";
    warning.textContent = "You haven't added a resume to your profile yet — this draft will be more generic. Add one from your profile for a stronger, more specific draft.";
    draftOverlay.querySelector(".draft-disclaimer").insertAdjacentElement("afterend", warning);
  }
 
  fetchDraft(studentId, currentDraftOppId);
});
 
draftRegenerateBtn.addEventListener("click", () => {
  const studentId = localStorage.getItem("studentId");
  if (!studentId || !currentDraftOppId) return;
  fetchDraft(studentId, currentDraftOppId, { regenerate: true });
});
 
draftCopyBtn.addEventListener("click", async () => {
  const textarea = draftBody.querySelector(".draft-textarea");
  if (!textarea) return;
  try {
    await navigator.clipboard.writeText(textarea.value);
    draftCopyBtn.textContent = "Copied!";
    setTimeout(() => { draftCopyBtn.textContent = "Copy"; }, 1500);
  } catch {
    textarea.select();
  }
});
 
loadOpportunities();
 