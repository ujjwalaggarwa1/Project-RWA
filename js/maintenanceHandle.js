import { renderMaintenance } from "./data-loader.js";

// --- MAINTENANCE PAGE UI ---
// Only activates when on the maintenance page.

export function initMaintenancePage(mergedMaintenance) {
  if (!document.getElementById("maintenance")) return;

  let cachedMaintenance = { ...mergedMaintenance };

  function toDateKey(d) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${d.getFullYear()}`;
  }

  function openModal(flat = "") {
    const err = document.getElementById("maint-form-error");
    if (err) err.textContent = "";
    if (flat) {
      document.getElementById("maint-flat").value = flat;
    }
    document.getElementById("maint-modal-overlay").classList.remove("hidden");
  }

  function closeModal() {
    document.getElementById("maint-modal-overlay").classList.add("hidden");
  }

  // Modal triggers
  const openBtn = document.getElementById("btn-pay-dues");
  if (openBtn) openBtn.addEventListener("click", () => openModal());

  const closeBtn = document.getElementById("maint-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  const overlay = document.getElementById("maint-modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target.id === "maint-modal-overlay") closeModal();
    });
  }

  // Form submit
  const submitBtn = document.getElementById("maint-form-submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const flat = document.getElementById("maint-flat").value.trim();
      const amount = document.getElementById("maint-amount").value.trim();
      const err = document.getElementById("maint-form-error");

      if (!flat) {
        if (err) err.textContent = "Flat number is required.";
        return;
      }

      const today = toDateKey(new Date());
      if (cachedMaintenance[flat]) {
        cachedMaintenance[flat].status = ["paid", today];
        if (amount) cachedMaintenance[flat].amount = amount;
      } else {
        cachedMaintenance[flat] = {
          resident: "Resident",
          amount: amount || 2000,
          due_date: "23-12-2026",
          status: ["paid", today],
        };
      }

      // save to localStorage
      let stored = {};
      try {
        stored = JSON.parse(localStorage.getItem("rwa_local_data")) || {};
      } catch (e) {}
      if (!stored.maintenance) stored.maintenance = {};
      stored.maintenance[flat] = cachedMaintenance[flat];
      localStorage.setItem("rwa_local_data", JSON.stringify(stored));

      renderMaintenance(cachedMaintenance);
      closeModal();
    });
  }

  // Pay button on card
  const list = document.querySelector(".maintenance-list");
  if (list) {
    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-pay");
      if (!btn) return;
      openModal(btn.dataset.flat);
    });
  }

  renderMaintenance(cachedMaintenance);
}
