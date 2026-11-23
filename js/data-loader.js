import { initBookingPage } from "./bookingHandle.js";
import { initComplaintPage } from "./complaintHandle.js";
import { initMaintenancePage } from "./maintenanceHandle.js";

export async function populate() {
  // Setup empty default structure
  let serverData = {
    notices: {},
    maintenance: {},
    bookings: {},
    complaints: {},
  };
  let localData = {
    notices: {},
    maintenance: {},
    bookings: {},
    complaints: {},
  };

  try {
    // Fetch path relative to root HTML page
    const response = await fetch("data/data.json");
    if (response.ok) {
      serverData = await response.json();
    }
  } catch (error) {
    console.error("Could not load server JSON:", error);
  }

  // Pull additional data from LocalStorage
  // local payload under the key "rwa_local_data"
  const stored = localStorage.getItem("rwa_local_data");
  if (stored) {
    try {
      localData = JSON.parse(stored);
    } catch (error) {
      console.error("Could not parse LocalStorage data:", error);
    }
  }

  // Merge the data (Local storage takes precedence if IDs overlap)
  const mergedData = {
    notices: { ...serverData.notices, ...localData.notices },
    maintenance: { ...serverData.maintenance, ...localData.maintenance },
    bookings: { ...serverData.bookings, ...localData.bookings },
    complaints: { ...serverData.complaints, ...localData.complaints },
  };

  // Render into the DOM
  renderNotices(mergedData.notices);
  renderMaintenance(mergedData.maintenance);
  renderBookings(mergedData.bookings);
  renderComplaints(mergedData.complaints);
  updateOverviewWidgets(mergedData);

  // Page-specific interactive handlers
  initBookingPage(mergedData.bookings);
  initComplaintPage(mergedData.complaints);
  initMaintenancePage(mergedData.maintenance);
}

// --- RENDER FUNCTIONS ---

function renderNotices(notices) {
  const container = document.querySelector(".notices-list");
  if (!container) return; // Skip if this container isn't on the current page

  let html = "";

  for (const [id, data] of Object.entries(notices)) {
    // Map priority string to a CSS color class
    const bgColor =
      data["priority-level"] === "high"
        ? "#ef4444"
        : data["priority-level"] === "medium"
          ? "#eab308"
          : "#3b82f6";

    html += `
            <div class="notice-card" data-id="${id}" style="--indi-color: ${bgColor};">
                <h4>${data.heading}</h4>
                <p>${data.description}</p>
                <span>${data.date}</span>
            </div>
        `;
  }
  container.innerHTML = html;
}

export function renderMaintenance(maintenance) {
  const container = document.querySelector(".maintenance-list");
  if (!container) return;

  let html = "";
  for (const [flat, data] of Object.entries(maintenance)) {
    const isPaid = data.status[0] === "paid";
    const isOverdue = data.status[0] === "overdue";
    const statusClass = isPaid
      ? "status-paid"
      : isOverdue
        ? "status-overdue"
        : "status-pending";
    const statusLabel = isPaid ? "PAID" : isOverdue ? "OVERDUE" : "PENDING";
    const paidDate =
      isPaid && data.status[1]
        ? `Cleared on: ${data.status[1]}`
        : `Due: ${data.due_date || "23-12-2026"}`;

    html += `
            <div class="maintenance-card" 
                 data-flat="${flat}" 
                 data-resident="${data.resident}" 
                 data-amount="${data.amount}" 
                 data-status="${data.status[0]}"
                 data-date="${data.status[1] || ""}">
                <div class="maint-top">
                    <div class="flat-info">
                        <h4>Flat ${flat}</h4>
                        <span class="resident-name">${data.resident}</span>
                    </div>
                    <span class="maint-badge ${statusClass}">${statusLabel}</span>
                </div>
                <div class="maint-mid">
                    <div class="amount-wrap">
                        <span class="amt-label">Maintenance Due</span>
                        <strong class="amt-val">₹${Number(data.amount).toLocaleString("en-IN")}</strong>
                    </div>
                    <span class="due-text">${paidDate}</span>
                </div>
                <div class="maint-actions">
                    ${
                      isPaid
                        ? `<button class="btn-maint-action btn-view-receipt">&#128196; View Receipt</button>`
                        : `<button class="btn-maint-action btn-pay-maint">&#10003; Pay Now</button>`
                    }
                </div>
            </div>
        `;
  }
  container.innerHTML = html;
}

export function renderComplaints(complaints) {
  const container = document.querySelector(".complaints-list");
  if (!container) return;

  function priorityColor(priority) {
    if (priority === "high") return "#ef4444";
    if (priority === "medium") return "#eab308";
    return "#3b82f6";
  }

  function statusLabel(status) {
    if (status === "resolved") return "Resolved";
    if (status === "in_progress") return "In Progress";
    return "Open";
  }

  function actionBtnText(status) {
    if (status === "open") return "Start Working";
    if (status === "in_progress") return "Mark Resolved";
    return "Reopen";
  }

  let html = "";
  for (const [id, data] of Object.entries(complaints || {})) {
    const color = priorityColor(data.priority);
    const statusClass = `status-${data.status}`;

    html += `
            <div class="complaint-card" 
                 data-id="${id}"
                 data-status="${data.status}"
                 data-category="${data.category}"
                 style="--priority-color: ${color};">
                <div class="cmp-top">
                    <div class="cmp-meta">
                        <span class="cmp-cat-badge">${data.category}</span>
                        <span class="cmp-id">#${id}</span>
                        <span class="cmp-priority-tag priority-${data.priority}">${data.priority} priority</span>
                    </div>
                    <span class="cmp-status-badge ${statusClass}">${statusLabel(data.status)}</span>
                </div>
                <h4 class="cmp-title">${data.title}</h4>
                <p class="cmp-desc">${data.description}</p>
                <div class="cmp-footer">
                    <div class="cmp-resident-info">
                        <strong>Flat ${data.flat}</strong> &bull; ${data.resident} &bull; <span>${data.date}</span>
                    </div>
                    <button class="btn-toggle-status" title="Cycle or update complaint status">
                        ${actionBtnText(data.status)}
                    </button>
                </div>
            </div>
        `;
  }
  container.innerHTML = html;
}

export function renderBookings(bookings) {
  function getTodayAmenityUsage() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const todayKey = `${dd}-${mm}-${now.getFullYear()}`;

    const allList = Object.values(bookings || {});
    return allList.filter((b) => b.booking_date === todayKey).length;
  }

  const todayBookingsCount = getTodayAmenityUsage();

  const container = document.querySelector(".bookings-list");
  if (!container) return todayBookingsCount;

  function statusColor(approval) {
    if (approval === "confirmed") return "#3b82f6";
    if (approval === "awaiting_payment") return "#eab308";
    if (approval?.startsWith("rejected")) return "#ef4444";
    return "#00000000";
  }

  function approvalLabel(approval) {
    const map = {
      confirmed: "Confirmed",
      awaiting_payment: "Awaiting Payment",
    };
    return map[approval] ?? approval.replace(/_/g, " ");
  }

  let html = "";
  for (const [id, data] of Object.entries(bookings)) {
    html += `
            <div class="booking-card"
                 data-id="${id}"
                 data-facility="${data.facility}"
                 data-approval="${data.approval_status}"
                 style="--status-color: ${statusColor(data.approval_status)}">
                <div class="bk-top">
                    <h4>${data.facility} &mdash; ${data.event_type}</h4>
                    <span class="approval-badge">${approvalLabel(data.approval_status)}</span>
                </div>
                <p>Flat ${data.flat} &bull; ${data.resident} &bull; Guests: ${data.guest_count}</p>
                <span>${data.booking_date} (${data.time_slot})</span>
            </div>
        `;
  }
  container.innerHTML = html;
  return todayBookingsCount;
}

function updateOverviewWidgets(data) {
  // 1. Complaints Widget on overview
  const compWidget = document.querySelector(".complaints-widget");
  if (compWidget) {
    const complaintsList = Object.values(data.complaints || {});
    const openCount = complaintsList.filter(
      (c) => c.status === "open" || c.status === "in_progress",
    ).length;

    let contentEl = compWidget.querySelector(".widget-content");
    if (!contentEl) {
      contentEl = document.createElement("div");
      contentEl.className = "widget-content";
      compWidget.appendChild(contentEl);
    }
    contentEl.innerHTML = `
            <div class="widget-stat-num">${openCount}</div>
            <div class="widget-stat-label">Active Complaints</div>
        `;
  }

  // 2. Bookings Widget on overview
  const bkWidget = document.querySelector(".bookings-widget");
  if (bkWidget) {
    const todayUsage = renderBookings(data.bookings);
    let contentEl = bkWidget.querySelector(".widget-content");
    if (!contentEl) {
      contentEl = document.createElement("div");
      contentEl.className = "widget-content";
      bkWidget.appendChild(contentEl);
    }
    contentEl.innerHTML = `
            <div class="widget-stat-num">${todayUsage}</div>
            <div class="widget-stat-label">Bookings Today</div>
        `;
  }

  // 3. Maintenance Widget on overview
  const maintWidget = document.querySelector(".maintence-widget");
  if (maintWidget) {
    const maintList = Object.values(data.maintenance || {});
    const pendingCount = maintList.filter((m) => m.status[0] !== "paid").length;

    let contentEl = maintWidget.querySelector(".widget-content");
    if (!contentEl) {
      contentEl = document.createElement("div");
      contentEl.className = "widget-content";
      maintWidget.appendChild(contentEl);
    }
    contentEl.innerHTML = `
            <div class="widget-stat-num">${pendingCount}</div>
            <div class="widget-stat-label">Unpaid Dues</div>
        `;
  }
}
