export async function populate() {
    // Setup empty default structure
    let serverData = { notices: {}, maintenance: {}, bookings: {} };
    let localData = { notices: {}, maintenance: {}, bookings: {} };

    try {
        const response = await fetch('/data/data.json');
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
        notices: { ...serverData.notices, ...localData.notices },
        maintenance: { ...serverData.maintenance, ...localData.maintenance },
        bookings: { ...serverData.bookings, ...localData.bookings }
    };

    // Render into the DOM
    renderNotices(mergedData.notices);
    renderMaintenance(mergedData.maintenance);
    renderBookings(mergedData.bookings);
}

// --- RENDER FUNCTIONS ---

function renderNotices(notices) {
    const container = document.querySelector('.notices-list');
    if (!container) return; // Skip if this container isn't on the current page

    let html = '';
    
    for (const [id, data] of Object.entries(notices)) {
        // Map priority string to a CSS color class
        const bgColor = data['priority-level'] === 'high' ? '#ef4444' : 
                        data['priority-level'] === 'medium' ? '#eab308' : '#3b82f6';

        html += `
            <div class="notice-card" data-id="${id}" style="--indi-color: ${bgColor};" >
                <div class="indicator"></div>
                <h4>${data.heading}</h4>
                <p>${data.description}</p>
                <span>${data.date}</span>
            </div>
        `;
    }
    container.innerHTML = html;
}

function renderMaintenance(maintenance) {
    // Assuming you have a <div class="maintenance-list"></div> somewhere
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

function renderBookings(bookings) {
    // Assuming you have a <div class="bookings-list"></div> somewhere
    const container = document.querySelector('.bookings-list');
    if (!container) return;

    let html = '';
    for (const [id, data] of Object.entries(bookings)) {
        html += `
            <div class="booking-card" data-id="${id}">
                <div class="indicator ${data.approval_status === 'confirmed' ? 'bg-blue' : 'bg-yellow'}"></div>
                <h4>${data.facility} - ${data.event_type}</h4>
                <p>Flat ${data.flat} | Guests: ${data.guest_count}</p>
                <span>${data.booking_date} (${data.time_slot})</span>
            </div>
        `;
    }
    container.innerHTML = html;
}

