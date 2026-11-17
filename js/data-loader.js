import { initBookingPage } from './bookingHandle.js';

export async function populate() {
    // Setup empty default structure
    let serverData = { notices: {}, maintenance: {}, bookings: {} };
    let localData  = { notices: {}, maintenance: {}, bookings: {} };

    try {
        const response = await fetch('data/data.json'); // the fetch function will use path relative to root html page not js file
        if (response.ok) {
            serverData = await response.json();
        }
    } catch (error) {
        console.error("Could not load server JSON:", error);
    }

    // Pull additional data from LocalStorage
    // local payload under the key "rwa_local_data"
    const stored = localStorage.getItem('rwa_local_data');
    if (stored) {
        try {
            localData = JSON.parse(stored);
        } catch (error) {
            console.error("Could not parse LocalStorage data:", error);
        }
    }

    // Merge the data (Local storage takes precedence if IDs overlap)
    const mergedData = {
        notices:     { ...serverData.notices,     ...localData.notices     },
        maintenance: { ...serverData.maintenance, ...localData.maintenance },
        bookings:    { ...serverData.bookings,    ...localData.bookings    }
    };

    // Render into the DOM
    renderNotices(mergedData.notices);
    renderMaintenance(mergedData.maintenance);
    renderBookings(mergedData.bookings);

    // Booking page interactive UI — only activates when on /booking
    initBookingPage(mergedData.bookings);
}


// --- RENDER FUNCTIONS ---

function renderNotices(notices) {
    const container = document.querySelector('.notices-list');
    if (!container) return; // Skip if this container isn't on the current page

    let html = '';

    for (const [id, data] of Object.entries(notices)) {
        // Map priority string to a CSS color class
        const bgColor = data['priority-level'] === 'high'   ? '#ef4444' :
                        data['priority-level'] === 'medium' ? '#eab308' : '#3b82f6';

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

function renderMaintenance(maintenance) {
    const container = document.querySelector('.maintenance-list');
    if (!container) return;

    let html = '';
    for (const [flat, data] of Object.entries(maintenance)) {
        const statusText = data.status.join(" - ");
        html += `
            <div class="maintenance-card" data-flat="${flat}">
                <div class="indicator ${data.status[0] === 'paid' ? 'bg-blue' : 'bg-red'}"></div>
                <h4>Flat ${flat} (${data.resident})</h4>
                <p>Amount: ₹${data.amount}</p>
                <span>Status: ${statusText}</span>
            </div>
        `;
    }
    container.innerHTML = html;
}

export function renderBookings(bookings) {
    // Calculates how many slots out of all bookings are booked for the current date
    function getTodayAmenityUsage() {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const todayKey = `${dd}-${mm}-${now.getFullYear()}`;

        const allList = Object.values(bookings || {});
        return allList.filter(b => b.booking_date === todayKey).length;
    }

    const todayBookingsCount = getTodayAmenityUsage();

    const container = document.querySelector('.bookings-list');
    if (!container) return todayBookingsCount;

    // Status colour — used as CSS custom property on each card
    function statusColor(approval) {
        if (approval === 'confirmed')        return '#3b82f6';
        if (approval === 'awaiting_payment') return '#eab308';
        if (approval?.startsWith('rejected'))return '#ef4444';
        return '#00000000';
    }

    // Human-readable approval label
    function approvalLabel(approval) {
        const map = { confirmed: 'Confirmed', awaiting_payment: 'Awaiting Payment' };
        return map[approval] ?? approval.replace(/_/g, ' ');
    }

    let html = '';
    for (const [id, data] of Object.entries(bookings)) {
        // data-facility and data-approval drive the filter chips (show/hide via JS)
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

