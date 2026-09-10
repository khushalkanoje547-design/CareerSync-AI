const API_BASE = "http://localhost:5000/api";
 
const content = document.getElementById("content");
const oppsCount = document.getElementById("oppsCount");
 
function formatDeadline(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  const formatted = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
 
  if (daysLeft <= 7) {
    return `<strong>${formatted}</strong> — ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  }
  return `<strong>${formatted}</strong>`;
}
 
function renderOpportunities(opportunities) {
  if (opportunities.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        No matching opportunities right now — check back soon as new ones are added.
      </div>`;
    oppsCount.textContent = "";
    return;
  }
 
  oppsCount.textContent = `${opportunities.length} opportunit${opportunities.length === 1 ? "y" : "ies"} found`;
 
  const cards = opportunities.map(opp => `
    <div class="opp-card">
      <span class="opp-type">${opp.type.replace("_", " ")}</span>
      <h3>${opp.title}</h3>
      <p>${opp.description || ""}</p>
      <div class="opp-deadline">Deadline: ${formatDeadline(opp.deadline)}</div>
      <a href="${opp.link}" target="_blank" rel="noopener">View details</a>
    </div>
  `).join("");
 
  content.innerHTML = `<div class="opp-grid">${cards}</div>`;
}
 
async function loadOpportunities() {
  const studentId = localStorage.getItem("studentId");
 
  if (!studentId) {
    content.innerHTML = `
      <div class="empty-state">
        We couldn't find your profile. <a href="index.html">Fill it out again</a>.
      </div>`;
    return;
  }
 
  try {
    const res = await fetch(`${API_BASE}/opportunities/match/${studentId}`);
    const data = await res.json();
 
    if (!res.ok) {
      throw new Error(data.error || "Something went wrong while fetching matches.");
    }
 
    renderOpportunities(data);
 
  } catch (err) {
    content.innerHTML = `<div class="empty-state">${err.message}</div>`;
  }
}
 
loadOpportunities();
 