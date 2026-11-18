import { renderBookings } from './data-loader.js';

// --- BOOKING PAGE UI ---
// Only activates when the booking page fragment is in the DOM.
// Called by populate() on every page load; exits immediately on other pages.

export function initBookingPage(mergedBookings) {

    // Guard — only run on the booking page
    if (!document.getElementById('bk-date-grid')) return;

    // --- Constants ---

    const MONTHS = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
    ];

    // Three broad slots — times match data.json time_slot format "HH:MM - HH:MM"
    const BOOKING_SLOTS = [
        { label: 'Morning',   time: '06:00 - 12:00', startHour: 6  },
        { label: 'Afternoon', time: '12:00 - 18:00', startHour: 12 },
        { label: 'Evening',   time: '18:00 - 23:59', startHour: 18 },
    ];

    // --- State (closure-scoped to this page session) ---

    const now         = new Date();
    const todayKey    = toDateKey(now);
    let   viewYear    = now.getFullYear();
    let   viewMonth   = now.getMonth();     // 0-indexed
    let   selectedKey = todayKey;
    let   activeAmenity = 'Club House';
    let   pendingSlot   = null;             // { label, time } set when modal opens

    // Live booking cache — starts with populate()'s merged data.
    // Updated in-place when the user adds a new booking, so we never
    // need to re-fetch data.json just to refresh the UI.
    let cachedBookings = { ...mergedBookings };


    // --- Helpers ---

    // Returns "DD-MM-YYYY" — same format used throughout data.json
    function toDateKey(d) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}-${mm}-${d.getFullYear()}`;
    }

    function keyToDate(key) {
        const [dd, mm, yy] = key.split('-').map(Number);
        return new Date(yy, mm - 1, dd);
    }

    function formatDayLabel(key) {
        return keyToDate(key).toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    // Count bookings per date for the active amenity (for calendar dots)
    function countsByDate() {
        const map = new Map();
        for (const data of Object.values(cachedBookings)) {
            if (data.facility !== activeAmenity) continue;
            map.set(data.booking_date, (map.get(data.booking_date) ?? 0) + 1);
        }
        return map;
    }

    // All bookings for a specific date + amenity
    function bookingsForDay(dateKey) {
        return Object.values(cachedBookings).filter(
            d => d.booking_date === dateKey && d.facility === activeAmenity
        );
    }

    // Check if a booking's time_slot overlaps a slot's startHour
    function slotIsBooked(slotStartHour, timeSlotStr) {
        // time_slot looks like "18:00 - 23:00" or "06:00 - 12:00"
        const parts = timeSlotStr.split('-').map(s => parseInt(s.trim()));
        if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return false;
        return slotStartHour >= parts[0] && slotStartHour < parts[1];
    }


    // --- Render: Calendar ---

    function renderCalendar() {
        const label = document.getElementById('bk-month-label');
        const grid  = document.getElementById('bk-date-grid');
        if (!label || !grid) return;

        label.textContent = `${MONTHS[viewMonth]} ${viewYear}`;

        const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
        const counts       = countsByDate();

        let html = '';

        // Leading empty cells to align day 1 to the correct weekday column
        for (let i = 0; i < firstWeekday; i++) {
            html += `<div class="day-cell empty"></div>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dKey    = toDateKey(new Date(viewYear, viewMonth, d));
            const isPast  = dKey < todayKey;
            const isSel   = dKey === selectedKey;
            const isToday = dKey === todayKey;
            const booked  = counts.get(dKey) ?? 0;

            let cls = 'day-cell';
            if (isPast)  cls += ' past';
            if (isSel)   cls += ' selected';
            if (isToday) cls += ' today';

            const dot = booked > 0 ? `<span class="dot"></span>` : '';

            html += `
            <button class="${cls}"
                data-date-key="${dKey}"
                aria-label="${formatDayLabel(dKey)}, ${booked} booking${booked !== 1 ? 's' : ''}"
                aria-pressed="${isSel}">
                ${d}${dot}
            </button>`;
        }

        grid.innerHTML = html;
    }


    // --- Render: Day-slot panel ---

    function renderDayPanel() {
        const dayLabel = document.getElementById('bk-day-label');
        const dayHint  = document.getElementById('bk-day-hint');
        const slotList = document.getElementById('bk-slots-list');
        if (!dayLabel || !slotList) return;

        dayLabel.textContent = formatDayLabel(selectedKey);
        const isPast = selectedKey < todayKey;
        dayHint.textContent  = isPast
            ? 'This date has already passed.'
            : 'Choose an available slot to reserve it.';

        const dayBkgs = bookingsForDay(selectedKey);

        let html = '';
        for (const slot of BOOKING_SLOTS) {
            // Find a booking whose time_slot range contains this slot's start hour
            const booked = dayBkgs.find(b => slotIsBooked(slot.startHour, b.time_slot ?? ''));

            if (booked) {
                html += `
                <li class="slot-item booked">
                    <div style="width:100%">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;">
                            <div class="slot-info">
                                <div class="slot-label">
                                    ${slot.label}
                                    <span class="status-badge">Reserved</span>
                                </div>
                                <div class="slot-time">${slot.time}</div>
                            </div>
                        </div>
                        <dl class="slot-booking-dl">
                            <dt>Booked by</dt><dd>${booked.resident}</dd>
                            <dt>Flat</dt>     <dd>${booked.flat}</dd>
                            <dt>Event</dt>    <dd>${booked.event_type}</dd>
                            <dt>Guests</dt>   <dd>${booked.guest_count}</dd>
                        </dl>
                    </div>
                </li>`;
            } else {
                html += `
                <li class="slot-item available">
                    <div class="slot-info">
                        <div class="slot-label">
                            ${slot.label}
                            <span class="status-badge">Available</span>
                        </div>
                        <div class="slot-time">${slot.time}</div>
                    </div>
                    <button class="btn-reserve"
                        data-slot-label="${slot.label}"
                        data-slot-time="${slot.time}"
                        ${isPast ? 'disabled' : ''}>
                        Reserve
                    </button>
                </li>`;
            }
        }

        slotList.innerHTML = html;
    }



    // --- Modal ---

    function openModal(slotLabel, slotTime) {
        pendingSlot = { label: slotLabel, time: slotTime };

        document.getElementById('bk-modal-title').textContent =
            `Reserve — ${activeAmenity}`;
        document.getElementById('bk-modal-slot-info').innerHTML =
            `<strong>${formatDayLabel(selectedKey)}</strong>${slotLabel} · ${slotTime}`;
        document.getElementById('bk-form-error').textContent = '';
        document.getElementById('bk-resident').value          = '';
        document.getElementById('bk-flat').value              = '';
        document.getElementById('bk-event').value             = '';
        document.getElementById('bk-guests').value            = '0';

        const sub = document.getElementById('bk-form-submit');
        sub.disabled    = false;
        sub.textContent = 'Confirm Booking';

        document.getElementById('bk-modal-overlay').classList.remove('hidden');
    }

    function closeModal() {
        document.getElementById('bk-modal-overlay').classList.add('hidden');
        pendingSlot = null;
    }


    // --- Save booking ---
    // Writes to localStorage (rwa_local_data) using the same schema as data.json,
    // then updates cachedBookings and re-renders without re-fetching.

    function saveBooking(resident, flat, eventType, guestCount) {
        // Read current localStorage state
        let local = { notices: {}, maintenance: {}, bookings: {} };
        const stored = localStorage.getItem('rwa_local_data');
        if (stored) { try { local = JSON.parse(stored); } catch (_) {} }

        const id = `BKG-${Date.now()}`;
        const newEntry = {
            facility:        activeAmenity,
            flat:            flat,
            resident:        resident,
            event_type:      eventType,
            booking_date:    selectedKey,
            time_slot:       pendingSlot.time,
            guest_count:     guestCount,
            payment_status:  'pending',
            approval_status: 'awaiting_payment',
        };

        // Persist to localStorage
        local.bookings[id] = newEntry;
        localStorage.setItem('rwa_local_data', JSON.stringify(local));

        // Update in-memory cache so calendar + slots reflect it immediately
        cachedBookings[id] = newEntry;

        // Re-render the bookings list with the new entry appended
        renderBookings(cachedBookings);
    }


    // --- Events ---

    // Amenity tabs
    document.getElementById('bk-amenity-tabs').addEventListener('click', e => {
        const btn = e.target.closest('[data-amenity]');
        if (!btn) return;
        activeAmenity = btn.dataset.amenity;
        document.querySelectorAll('#bk-amenity-tabs button').forEach(b =>
            b.classList.toggle('active', b.dataset.amenity === activeAmenity));
        renderCalendar();
        renderDayPanel();
    });

    // Month navigation
    document.getElementById('bk-prev-month').addEventListener('click', () => {
        if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--;
        renderCalendar();
    });
    document.getElementById('bk-next-month').addEventListener('click', () => {
        if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++;
        renderCalendar();
    });

    // Date grid clicks — delegated to the grid container
    document.getElementById('bk-date-grid').addEventListener('click', e => {
        const cell = e.target.closest('[data-date-key]');
        if (!cell || cell.classList.contains('past') || cell.classList.contains('empty')) return;
        selectedKey = cell.dataset.dateKey;
        renderCalendar();
        renderDayPanel();
    });

    // Slot reserve buttons — delegated to the slot list
    document.getElementById('bk-slots-list').addEventListener('click', e => {
        const btn = e.target.closest('.btn-reserve');
        if (!btn || btn.disabled) return;
        openModal(btn.dataset.slotLabel, btn.dataset.slotTime);
    });

    // Modal dismiss — close button or backdrop click
    document.getElementById('bk-modal-close').addEventListener('click', closeModal);
    document.getElementById('bk-modal-overlay').addEventListener('click', e => {
        if (e.target.id === 'bk-modal-overlay') closeModal();
    });

    // Modal form submit
    document.getElementById('bk-form-submit').addEventListener('click', () => {
        const residentVal = document.getElementById('bk-resident').value.trim();
        const flatVal     = document.getElementById('bk-flat').value.trim();
        const eventVal    = document.getElementById('bk-event').value.trim();
        const guestVal    = parseInt(document.getElementById('bk-guests').value, 10);
        const errorEl     = document.getElementById('bk-form-error');

        if (!residentVal || !flatVal) {
            errorEl.textContent = 'Name and flat number are required.'; return;
        }
        if (!eventVal) {
            errorEl.textContent = 'Please enter an event type.'; return;
        }
        if (isNaN(guestVal) || guestVal < 0 || guestVal > 1000) {
            errorEl.textContent = 'Guest count must be between 0 and 1000.'; return;
        }

        const sub = document.getElementById('bk-form-submit');
        sub.disabled    = true;
        sub.textContent = 'Saving…';

        saveBooking(residentVal, flatVal, eventVal, guestVal);
        closeModal();
        renderCalendar();
        renderDayPanel();
    });

    // --- Initial render ---
    renderCalendar();
    renderDayPanel();
    // renderBookings() already ran above (from populate)
}
