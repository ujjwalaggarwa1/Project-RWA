import { renderMaintenance } from "./data-loader.js";

// --- MAINTENANCE PAGE UI ---
// Activates when the maintenance page fragment is in the DOM.
// Called by populate() on every page load; exits immediately on other pages.

export function initMaintenancePage(mergedMaintenance) {
  const section = document.getElementById("maintenance");
  if (!section) return;

  // Live cache
  let cachedMaintenance = { ...mergedMaintenance };
  let activeFilter = "all";
  let searchQuery = "";

  // DOM references
  const modalOverlay = document.getElementById("maint-modal-overlay");
  const modalCloseBtn = document.getElementById("maint-modal-close");
  const openModalBtn = document.getElementById("btn-open-payment-modal");
  const formSubmitBtn = document.getElementById("maint-form-submit");
  const formErrorEl = document.getElementById("maint-form-error");

  const flatInput = document.getElementById("maint-flat");
  const residentInput = document.getElementById("maint-resident");
  const amountInput = document.getElementById("maint-amount");
  const methodSelect = document.getElementById("maint-method");
  const refInput = document.getElementById("maint-ref");

  const searchInput = document.getElementById("maint-search-input");
  const filterRow = document.getElementById("maint-filter-row");
  const container = document.querySelector(".maintenance-list");

  // Receipt modal references
  const receiptOverlay = document.getElementById("maint-receipt-overlay");
  const receiptCloseBtn = document.getElementById("maint-receipt-close");
  const receiptPrintBtn = document.getElementById("maint-receipt-print");
  const receiptBody = document.getElementById("maint-receipt-body");

  // --- Helpers ---
  function toDateKey(d) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${d.getFullYear()}`;
  }

  function updateStats() {
    const all = Object.values(cachedMaintenance || {});
    const totalBilled = all.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );

    const paidItems = all.filter((item) => item.status[0] === "paid");
    const paidTotal = paidItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );

    const pendingItems = all.filter((item) => item.status[0] === "pending");
    const pendingTotal = pendingItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );

    const overdueItems = all.filter((item) => item.status[0] === "overdue");
    const overdueTotal = overdueItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );

    const statTotal = document.getElementById("maint-stat-total");
    const statFlats = document.getElementById("maint-stat-flats");
    const statCollected = document.getElementById("maint-stat-collected");
    const statPaidCount = document.getElementById("maint-stat-paid-count");
    const statPending = document.getElementById("maint-stat-pending");
    const statPendingCount = document.getElementById(
      "maint-stat-pending-count",
    );
    const statOverdue = document.getElementById("maint-stat-overdue");
    const statOverdueCount = document.getElementById(
      "maint-stat-overdue-count",
    );

    if (statTotal)
      statTotal.textContent = `₹${totalBilled.toLocaleString("en-IN")}`;
    if (statFlats) statFlats.textContent = `${all.length} flats billed`;
    if (statCollected)
      statCollected.textContent = `₹${paidTotal.toLocaleString("en-IN")}`;
    if (statPaidCount)
      statPaidCount.textContent = `${paidItems.length} flats cleared`;
    if (statPending)
      statPending.textContent = `₹${pendingTotal.toLocaleString("en-IN")}`;
    if (statPendingCount)
      statPendingCount.textContent = `${pendingItems.length} pending`;
    if (statOverdue)
      statOverdue.textContent = `₹${overdueTotal.toLocaleString("en-IN")}`;
    if (statOverdueCount)
      statOverdueCount.textContent = `${overdueItems.length} overdue`;
  }

  function applyFilterAndSearch() {
    const cards = document.querySelectorAll(
      ".maintenance-list .maintenance-card",
    );
    const q = searchQuery.toLowerCase().trim();

    cards.forEach((card) => {
      const flat = (card.dataset.flat || "").toLowerCase();
      const resident = (card.dataset.resident || "").toLowerCase();
      const status = (card.dataset.status || "").toLowerCase();

      // Match search
      const matchSearch = !q || flat.includes(q) || resident.includes(q);

      // Match filter
      let matchFilter = false;
      if (activeFilter === "all") {
        matchFilter = true;
      } else if (
        activeFilter === "paid" ||
        activeFilter === "pending" ||
        activeFilter === "overdue"
      ) {
        matchFilter = status === activeFilter;
      } else if (activeFilter === "Block A") {
        matchFilter = flat.startsWith("a-") || flat.startsWith("a");
      } else if (activeFilter === "Block B") {
        matchFilter = flat.startsWith("b-") || flat.startsWith("b");
      } else if (activeFilter === "Block C") {
        matchFilter = flat.startsWith("c-") || flat.startsWith("c");
      }

      card.hidden = !(matchSearch && matchFilter);
    });
  }

  function openModal(
    prefillFlat = "",
    prefillResident = "",
    prefillAmount = "",
  ) {
    if (!modalOverlay) return;
    formErrorEl.textContent = "";
    flatInput.value = prefillFlat;
    residentInput.value = prefillResident;
    amountInput.value = prefillAmount;
    refInput.value = "";
    methodSelect.value = "UPI";
    formSubmitBtn.disabled = false;
    formSubmitBtn.textContent = "Confirm Payment";
    modalOverlay.classList.remove("hidden");
    if (prefillFlat) {
      amountInput.focus();
    } else {
      flatInput.focus();
    }
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add("hidden");
  }

  function showReceipt(flat, resident, amount, method, refId, date) {
    if (!receiptOverlay || !receiptBody) return;
    const txnId = refId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    receiptBody.innerHTML = `
            <div class="receipt-row"><span>Receipt No:</span> <strong>#RWA-${flat}-${Date.now().toString().slice(-4)}</strong></div>
            <div class="receipt-row"><span>Flat & Resident:</span> <strong>Flat ${flat} &mdash; ${resident}</strong></div>
            <div class="receipt-row"><span>Amount Paid:</span> <strong class="receipt-amt">₹${Number(amount).toLocaleString("en-IN")}</strong></div>
            <div class="receipt-row"><span>Payment Method:</span> <span>${method}</span></div>
            <div class="receipt-row"><span>Reference ID:</span> <code>${txnId}</code></div>
            <div class="receipt-row"><span>Date Cleared:</span> <span>${date}</span></div>
            <div class="receipt-row"><span>Status:</span> <span class="badge-status-paid">PAID &bull; VERIFIED</span></div>
        `;
    receiptOverlay.classList.remove("hidden");
  }

  function closeReceipt() {
    if (!receiptOverlay) return;
    receiptOverlay.classList.add("hidden");
  }

  function recordPayment(flat, resident, amount, method, refId) {
    const today = toDateKey(new Date());

    if (cachedMaintenance[flat]) {
      cachedMaintenance[flat].resident =
        resident || cachedMaintenance[flat].resident;
      cachedMaintenance[flat].amount = amount || cachedMaintenance[flat].amount;
      cachedMaintenance[flat].status = ["paid", today];
    } else {
      cachedMaintenance[flat] = {
        resident: resident,
        amount: Number(amount) || 2000,
        due_date: "23-12-2026",
        status: ["paid", today],
      };
    }

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

    if (!localData.maintenance) localData.maintenance = {};
    localData.maintenance[flat] = cachedMaintenance[flat];
    localStorage.setItem("rwa_local_data", JSON.stringify(localData));

    renderMaintenance(cachedMaintenance);
    updateStats();
    applyFilterAndSearch();
    showReceipt(flat, resident, amount, method, refId, today);
  }

  // --- Events ---
  if (openModalBtn) openModalBtn.addEventListener("click", () => openModal());
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  if (receiptCloseBtn) receiptCloseBtn.addEventListener("click", closeReceipt);
  if (receiptPrintBtn)
    receiptPrintBtn.addEventListener("click", () => window.print());
  if (receiptOverlay) {
    receiptOverlay.addEventListener("click", (e) => {
      if (e.target === receiptOverlay) closeReceipt();
    });
  }

  if (formSubmitBtn) {
    formSubmitBtn.addEventListener("click", () => {
      const flat = flatInput.value.trim().toUpperCase();
      const resident = residentInput.value.trim();
      const amount = amountInput.value.trim();
      const method = methodSelect.value;
      const ref = refInput.value.trim();

      if (!flat) {
        formErrorEl.textContent = "Flat number is required.";
        return;
      }
      if (!resident) {
        formErrorEl.textContent = "Resident name is required.";
        return;
      }
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        formErrorEl.textContent = "Please enter a valid payment amount.";
        return;
      }

      formSubmitBtn.disabled = true;
      formSubmitBtn.textContent = "Processing…";

      closeModal();
      recordPayment(flat, resident, amount, method, ref);
    });
  }

  // Search input
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      applyFilterAndSearch();
    });
  }

  // Filter chips
  if (filterRow) {
    filterRow.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      filterRow
        .querySelectorAll(".filter-chip")
        .forEach((c) => c.classList.toggle("active", c === chip));
      activeFilter = chip.dataset.filter;
      applyFilterAndSearch();
    });
  }

  // Individual card actions: Pay Now & View Receipt
  if (container) {
    container.addEventListener("click", (e) => {
      const payBtn = e.target.closest(".btn-pay-maint");
      if (payBtn) {
        const card = payBtn.closest(".maintenance-card");
        if (card) {
          openModal(
            card.dataset.flat,
            card.dataset.resident,
            card.dataset.amount,
          );
        }
        return;
      }

      const receiptBtn = e.target.closest(".btn-view-receipt");
      if (receiptBtn) {
        const card = receiptBtn.closest(".maintenance-card");
        if (card) {
          const flat = card.dataset.flat;
          const resident = card.dataset.resident;
          const amount = card.dataset.amount;
          const date = card.dataset.date || toDateKey(new Date());
          showReceipt(
            flat,
            resident,
            amount,
            "Online / Recorded",
            `TXN-REC-${flat}`,
            date,
          );
        }
      }
    });
  }

  // Initial render & stats
  renderMaintenance(cachedMaintenance);
  updateStats();
  applyFilterAndSearch();
}
