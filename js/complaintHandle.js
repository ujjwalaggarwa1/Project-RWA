import { renderComplaints } from "./data-loader.js";

// --- COMPLAINTS PAGE UI ---
// Only activates when on the complaints page.

export function initComplaintPage(mergedComplaints) {
  if (!document.getElementById("complaint")) return;

  let cachedComplaints = { ...mergedComplaints };

  function toDateKey(d) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${d.getFullYear()}`;
  }

  function openModal() {
    const err = document.getElementById("cmp-form-error");
    if (err) err.textContent = "";
    document.getElementById("cmp-modal-overlay").classList.remove("hidden");
  }

  function closeModal() {
    document.getElementById("cmp-modal-overlay").classList.add("hidden");
  }

  // Modal triggers
  const openBtn = document.getElementById("btn-file-complaint");
  if (openBtn) openBtn.addEventListener("click", openModal);

  const closeBtn = document.getElementById("cmp-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  const overlay = document.getElementById("cmp-modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target.id === "cmp-modal-overlay") closeModal();
    });
  }

  // Form submit
  const submitBtn = document.getElementById("cmp-form-submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const resident = document.getElementById("cmp-resident").value.trim();
      const flat = document.getElementById("cmp-flat").value.trim();
      const category = document.getElementById("cmp-category").value;
      const priority = document.getElementById("cmp-priority").value;
      const title = document.getElementById("cmp-title").value.trim();
      const desc = document.getElementById("cmp-desc").value.trim();
      const err = document.getElementById("cmp-form-error");

      if (!resident || !flat) {
        if (err) err.textContent = "Name and flat number are required.";
        return;
      }
      if (!title) {
        if (err) err.textContent = "Please enter a title.";
        return;
      }

      const id = `CMP-${String(Object.keys(cachedComplaints).length + 1).padStart(3, "0")}`;
      const newComplaint = {
        flat,
        resident,
        category,
        priority,
        title,
        description: desc,
        status: "open",
        date: toDateKey(new Date()),
      };

      cachedComplaints[id] = newComplaint;

      // save to localStorage
      let stored = {};
      try {
        stored = JSON.parse(localStorage.getItem("rwa_local_data")) || {};
      } catch (e) {}
      if (!stored.complaints) stored.complaints = {};
      stored.complaints[id] = newComplaint;
      localStorage.setItem("rwa_local_data", JSON.stringify(stored));

      renderComplaints(cachedComplaints);
      closeModal();
    });
  }

  // Card status button (resolve / reopen)
  const list = document.querySelector(".complaints-list");
  if (list) {
    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-status");
      if (!btn) return;
      const id = btn.dataset.id;
      if (!cachedComplaints[id]) return;

      cachedComplaints[id].status =
        cachedComplaints[id].status === "resolved" ? "open" : "resolved";

      let stored = {};
      try {
        stored = JSON.parse(localStorage.getItem("rwa_local_data")) || {};
      } catch (e) {}
      if (!stored.complaints) stored.complaints = {};
      stored.complaints[id] = cachedComplaints[id];
      localStorage.setItem("rwa_local_data", JSON.stringify(stored));

      renderComplaints(cachedComplaints);
    });
  }

  renderComplaints(cachedComplaints);
}
