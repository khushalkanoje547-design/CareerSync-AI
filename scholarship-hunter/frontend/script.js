const API_BASE = "http://localhost:5000/api";

const form = document.getElementById("profileForm");
const errorMsg = document.getElementById("errorMsg");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const skillsRaw = document.getElementById("skills").value;
  const skillsArray = skillsRaw
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    branch: document.getElementById("branch").value,
    year: parseInt(document.getElementById("year").value),
    category: document.getElementById("category").value,
    location: document.getElementById("location").value,
    skills: skillsArray
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  try {
    const res = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong. Please try again.");
    }

    localStorage.setItem("studentId", data._id);
    window.location.href = "opportunities.html";

  } catch (err) {
    errorMsg.textContent = err.message;
    submitBtn.disabled = false;
    submitBtn.textContent = "Find my opportunities";
  }
});
