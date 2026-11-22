import { renderComplaints } from "./data-loader.js";

// --- COMPLAINTS PAGE UI ---
// Only activates when the complaint page fragment is in the DOM.
// Called by populate() on every page load; exits immediately on other pages.

export function initComplaintPage(mergedComplaints) {
  const section = document.getElementById("complaint");
  if (!section) return;

  // Live complaint cache
  let cachedComplaints = { ...mergedComplaints };
  let activeFilter = "all";

  // DOM references
  const modalOverlay = document.getElementById("cmp-modal-overlay");
  const modalCloseBtn = document.getElementById("cmp-modal-close");
  const openModalBtn = document.getElementById("btn-open-complaint-modal");
  const formSubmitBtn = document.getElementById("cmp-form-submit");
  const formErrorEl = document.getElementById("cmp-form-error");

  const residentInput = document.getElementById("cmp-resident");
  const flatInput = document.getElementById("cmp-flat");
  const categorySelect = document.getElementById("cmp-category");
  const prioritySelect = document.getElementById("cmp-priority");
  const titleInput = document.getElementById("cmp-title");
  const descInput = document.getElementById("cmp-desc");

  const filterRow = document.getElementById("cmp-filter-row");
  const container = document.querySelector(".complaints-list");

  // --- Helpers ---
  function toDateKey(d) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${d.getFullYear()}`;
  }

  function updateStats() {
    const all = Object.values(cachedComplaints || {});
    const total = all.length;
    const open = all.filter((c) => c.status === "open").length;
    const inProgress = all.filter((c) => c.status === "in_progress").length;
    const resolved = all.filter((c) => c.status === "resolved").length;

    const statTotal = document.getElementById("stat-total-complaints");
    const statOpen = document.getElementById("stat-open-complaints");
    const statProgress = document.getElementById("stat-progress-complaints");
    const statResolved = document.getElementById("stat-resolved-complaints");

    if (statTotal) statTotal.textContent = total;
    if (statOpen) statOpen.textContent = open;
    if (statProgress) statProgress.textContent = inProgress;
    if (statResolved) statResolved.textContent = resolved;
  }

  function applyFilter(filterValue) {
    activeFilter = filterValue;
    const cards = document.querySelectorAll(".complaints-list .complaint-card");
    cards.forEach((card) => {
      if (filterValue === "all") {
        card.hidden = false;
        return;
      }
      const matchStatus = card.dataset.status === filterValue;
      const matchCategory =
        card.dataset.category?.toLowerCase() === filterValue.toLowerCase();
      card.hidden = !matchStatus && !matchCategory;
    });
  }

  function openModal() {
    if (!modalOverlay) return;
    formErrorEl.textContent = "";
    residentInput.value = "";
    flatInput.value = "";
    titleInput.value = "";
    descInput.value = "";
    categorySelect.value = "Plumbing";
    prioritySelect.value = "medium";
    formSubmitBtn.disabled = false;
    formSubmitBtn.textContent = "Submit Complaint";
    modalOverlay.classList.remove("hidden");
    residentInput.focus();
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add("hidden");
  }

  function saveComplaint(
    resident,
    flat,
    category,
    priority,
    title,
    description,
  ) {
    const idList = Object.keys(cachedComplaints);
    const nextNum = idList.length + 1;
    const newId = `CMP-${String(nextNum).padStart(3, "0")}`;
    const newRecord = {
      flat,
      resident,
      category,
      title,
      description,
      priority,
      status: "open",
      date: toDateKey(new Date()),
    };

    cachedComplaints[newId] = newRecord;

    // Persist to localStorage
    let localData = {
      notices: {},
      maintenance: {},
      bookings: {},
      complaints: {},
    };
    try {
      const stored = localStorage.getItem("rwa_local_data");
      if (stored) localData = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse localStorage:", e);
    }

    if (!localData.complaints) localData.complaints = {};
    localData.complaints[newId] = newRecord;
    localStorage.setItem("rwa_local_data", JSON.stringify(localData));

    // Re-render
    renderComplaints(cachedComplaints);
    updateStats();
    applyFilter(activeFilter);
  }

  function toggleComplaintStatus(id) {
    if (!cachedComplaints[id]) return;
    const current = cachedComplaints[id].status;
    let nextStatus = "in_progress";
    if (current === "open") nextStatus = "in_progress";
    else if (current === "in_progress") nextStatus = "resolved";
    else if (current === "resolved") nextStatus = "open";

    cachedComplaints[id].status = nextStatus;

    // Update localStorage
    let localData = {
      notices: {},
      maintenance: {},
      bookings: {},
      complaints: {},
    };
    try {
      const stored = localStorage.getItem("rwa_local_data");
      if (stored) localData = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse localStorage:", e);
    }

    if (!localData.complaints) localData.complaints = {};
    localData.complaints[id] = cachedComplaints[id];
    localStorage.setItem("rwa_local_data", JSON.stringify(localData));

    renderComplaints(cachedComplaints);
    updateStats();
    applyFilter(activeFilter);
  }

  // --- Event Listeners ---
  if (openModalBtn) openModalBtn.addEventListener("click", openModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  if (formSubmitBtn) {
    formSubmitBtn.addEventListener("click", () => {
      const resident = residentInput.value.trim();
      const flat = flatInput.value.trim();
      const title = titleInput.value.trim();
      const desc = descInput.value.trim();
      const category = categorySelect.value;
      const priority = prioritySelect.value;

      if (!resident || !flat) {
        formErrorEl.textContent = "Name and flat number are required.";
        return;
      }
      if (!title) {
        formErrorEl.textContent = "Please enter a title for the complaint.";
        return;
      }
      if (!desc) {
        formErrorEl.textContent = "Please provide a short description.";
        return;
      }

      formSubmitBtn.disabled = true;
      formSubmitBtn.textContent = "Submitting…";

      saveComplaint(resident, flat, category, priority, title, desc);
      closeModal();
    });
  }

  // Filter clicks
  if (filterRow) {
    filterRow.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      filterRow
        .querySelectorAll(".filter-chip")
        .forEach((c) => c.classList.toggle("active", c === chip));
      applyFilter(chip.dataset.filter);
    });
  }

  // Card interactive actions (status toggle button)
  if (container) {
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-toggle-status");
      if (!btn) return;
      const card = btn.closest(".complaint-card");
      if (!card || !card.dataset.id) return;
      toggleComplaintStatus(card.dataset.id);
    });
  }

  // Initial render & stats
  renderComplaints(cachedComplaints);
  updateStats();
  applyFilter(activeFilter);
}
