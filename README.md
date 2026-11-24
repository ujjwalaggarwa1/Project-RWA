# Neighbourly — Resident Welfare Association Portal

> A lightweight, zero-framework SPA (Single Page Application) for managing a residential society — notices, maintenance dues, facility bookings, complaints, and more.

> **University Project** — Lovely Professional University (LPU). Frontend-only by design; backend behaviour is simulated using predefined static JSON data and `localStorage`.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Architecture](#architecture)
  - [SPA Router](#spa-router)
  - [Navigation](#navigation)
  - [Data Layer & Backend Simulation](#data-layer--backend-simulation)
  - [Theme System](#theme-system)
  - [Mobile Menu](#mobile-menu)
  - [GitHub Pages Compatibility](#github-pages-compatibility)
- [Pages & Routes](#pages--routes)
- [Data Schema](#data-schema)
  - [`data/data.json`](#datadatajson)
  - [`localStorage` (`rwa_local_data`)](#localstorage-rwa_local_data)
- [Styling System](#styling-system)
- [Running Locally](#running-locally)
- [Configuration](#configuration)
- [Authors](#authors)
- [Real Contributes](#real-contributes)

---

## Overview

**Neighbourly** is a **frontend-only** web portal built as a university project at Lovely Professional University (LPU). It simulates a full Resident Welfare Association (RWA) management system — society notices, maintenance dues, facility bookings, and complaints — without any real backend server.

Because this is a frontend-centric engineering demonstration, backend behaviour is emulated in two cooperative tiers:

1. **Predefined Static JSON API (`data/data.json`):** Acts as the remote database/server response, providing baseline seed data for notices, maintenance ledgers, facility bookings, and complaints.
2. **Client-Side Simulation Layer (`localStorage`):** User interactions — reserving amenities, recording dues payments, filing grievances, or toggling ticket statuses — are validated and persisted to browser storage under the `rwa_local_data` key.

On every page load and route transition, these two datasets are seamlessly merged, with local client additions and status updates taking precedence over server seed data.

The app is built as a **vanilla JS SPA** using the browser's native `History API` for routing. Pages are HTML fragments fetched on demand and injected into a single shell (`index.html`), giving the feel of a multi-page app without full page reloads.

---

## Features

| Feature | Description |
|---|---|
| 📋 **Notices Board** | Society announcements categorized with visual priority borders (High / Medium / Low). |
| 🔧 **Maintenance & Financial Ledger** | Society-wide dues ledger, 4 financial KPI cards (Total Billed, Collected, Pending, Overdue), live search/filter by flat or resident, payment recording modal, and printable digital receipts. |
| 📅 **Facility Bookings** | Multi-amenity selector (Club House & Party Lawn), interactive calendar with reservation dots, slot collision engine (Morning / Afternoon / Evening), and booking modal with instant confirmation. |
| 🛠️ **Complaints & Grievances** | Issue tracking with status KPI cards (Total, Open, In Progress, Resolved), category and priority filters, ticket submission modal, and status lifecycle progression. |
| 👤 **Resident / Admin View** | UI role switcher in the navigation bar (admin functionality reserved for future backend). |
| 🌙 **Dark / Light Theme** | Smooth animated SVG icon transition cycling through 7 glyph states; user preference persisted in `localStorage`. |
| 📱 **Fully Responsive** | Desktop top bar, collapsed tooltips on intermediate screens, and an animated hamburger-to-sidebar mobile drawer (≤650px). |
| ⚡ **SPA Navigation** | Zero full-page reloads using native HTML5 History API; animated indicator line tracks active nav links via `ResizeObserver`. |
| 💾 **localStorage Simulation** | Full client-side persistence for bookings, cleared dues, and complaints merged with baseline JSON. |
| 🌐 **GitHub Pages Ready** | Custom `404.html` redirect shim preserves deep-linking and back/forward navigation on static hosts. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Vanilla JavaScript (ES Modules) — No framework dependencies |
| Styling | Custom CSS (CSS custom properties, modern `oklch` color tokens, `@keyframes`) |
| Fonts | Google Fonts — Poppins, Goldman, Nunito, Short Stack, Noto Serif Dives Akuru |
| Icons | Inline SVG (Lucide icon set + custom path animations) |
| Dev Server | [Vite](https://vitejs.dev/) (dev only — no bundling used; files served as-is) |
| Data ("Backend") | Static JSON files + `localStorage` for simulated persistence |
| Hosting | GitHub Pages / any static file host |

> **Note:** Vite is used **strictly as a development server** with hot-reload (full-page reload on save). The project does **not** rely on any Vite build pipeline, bundlers, or transpilers — the source files are deployed directly as plain static files.

---

## Folder Structure

```
Project-RWA/
│
├── index.html            # App shell — nav, sidebar, content mount point, scripts
├── 404.html              # GitHub Pages SPA redirect shim
├── style.css             # Application stylesheet (single file, ~2,637 lines)
├── favicon.ico           # Site favicon
├── config.json           # Site name + route-to-file mapping
│
├── pages/                # HTML page fragments (loaded dynamically by router.js)
│   ├── overview.html     # Dashboard / home page with notice board & widgets
│   ├── notices.html      # Notices listing page
│   ├── maintenance.html  # Maintenance dues & financial ledger page
│   ├── booking.html      # Facility bookings & calendar reservation page
│   ├── complaint.html    # Complaints & grievance redressal page
│   ├── about.html        # About / info page (in development)
│   ├── fee.html          # Legacy placeholder (route dropped from config.json)
│   └── 404.html          # Not-found fragment (custom SVG illustration)
│
├── js/                   # All JavaScript modules
│   ├── router.js         # SPA router — fetches & renders page fragments
│   ├── navigate.js       # Click-delegation navigation + pushState wrapper
│   ├── data-loader.js    # Data orchestration — fetches JSON, merges localStorage, renders DOM
│   ├── bookingHandle.js  # Calendar rendering, slot collision detection, booking modal & persistence
│   ├── maintenanceHandle.js # Financial KPIs, payment recording modal, digital receipt generator
│   ├── complaintHandle.js   # Grievance filtering, ticket submission modal, status toggles
│   ├── theme_handle.js   # Dark/light theme toggle with 7-step SVG morphing animation
│   └── menu_btn.js       # Mobile hamburger menu open/close & backdrop animations
│
├── data/                 # Static data files (simulated REST API responses)
│   ├── data.json         # Notices, maintenance dues, bookings, and complaints baseline data
│   └── admin-data.json   # Admin-specific data (reserved for future admin authentication)
│
├── assets/               # Static assets
│   └── apartment.svg     # SVG illustration used in the 404 page
│
├── vite.config.js        # Vite dev server config (port 8000, full-reload plugin)
├── package.json          # npm metadata + Vite dev dependency
│
├── input.css             # Legacy CSS (reference only, not in use)
├── output.css            # Legacy CSS (reference only, not in use)
└── readme_extra.md       # Note about legacy CSS files
```

---

## Architecture

### SPA Router

**`js/router.js`** serves as the central navigation controller.

```
URL change  ──►  render()  ──►  routes lookup in config.json
                                       │
                              page(file, rootId)
                                       │
                        fetch(`pages/${file}.html`)
                                       │
                     container.innerHTML = html  ──►  populate()
                                                           │
                                                     updater() + setActive()
```

Key design decisions:

- **Dynamic Base Extraction:** Calculates the deployment root mathematically using `import.meta.url`. It works without path modification on `localhost`, custom domains, and GitHub Pages sub-directories (e.g. `/Project-RWA/`).
- **Race Condition Guard:** A monotonically increasing `latestRequest` counter discards outdated responses if a user clicks through multiple routes rapidly.
- **Animated Active Indicator:** Positions an indicator line under the active navigation button using CSS custom properties (`--x`, `--y`, `--w`, `--h`), updated reactively with a `ResizeObserver`.
- **Automatic Footer Visibility:** Hides the footer automatically on full-bleed routes such as `/about`.
- **Font & Layout Stabilization:** Awaits `document.fonts.ready` before final measurement to eliminate layout shift caused by external Google Fonts.

---

### Navigation

**`js/navigate.js`** handles internal link transitions via **event delegation** on `document`.

Any element with a `data-link` attribute (buttons or anchor tags) is intercepted:
```html
<a href="/notices" data-link>Notices</a>
<button data-link="/booking">Bookings</button>
```

The module prevents default browser navigation, executes `history.pushState(null, "", withBase(path))`, and manually invokes `render()` from `router.js`. Back and forward browser actions are caught by a global `popstate` listener.

---

### Data Layer & Backend Simulation

**`js/data-loader.js`** is the data backbone of the application. On every route change, it executes `populate()` to merge server defaults with local modifications and coordinate page controllers.

#### 1. Data Flow & Synchronization

```
┌─────────────────────────────────┐       ┌──────────────────────────────────┐
│   Server Data: data/data.json   │       │  Local Data: localStorage        │
│  (Notices, Dues, Bookings,      │       │  (Key: "rwa_local_data")         │
│   Complaints Baseline)          │       │  (User Additions & Overrides)    │
└────────────────┬────────────────┘       └─────────────────┬────────────────┘
                 │                                          │
                 └──────────────────► ◄─────────────────────┘
                                       │
                         Deep Merge (Local Overrides Win)
                                       │
                         ┌─────────────┴─────────────┐
                         ▼                           ▼
                Render into Active DOM      Initialize Interactive
                Containers:                 Controllers:
                • renderNotices()           • initBookingPage()
                • renderMaintenance()       • initMaintenancePage()
                • renderBookings()          • initComplaintPage()
                • renderComplaints()
                • updateOverviewWidgets()
```

1. **Reading & Merging:**
   ```javascript
   const mergedData = {
     notices: { ...serverData.notices, ...localData.notices },
     maintenance: { ...serverData.maintenance, ...localData.maintenance },
     bookings: { ...serverData.bookings, ...localData.bookings },
     complaints: { ...serverData.complaints, ...localData.complaints },
   };
   ```
   If an ID already exists in both datasets (e.g., an existing flat's maintenance status is modified from pending to paid), the `localStorage` version takes precedence.

2. **DOM Rendering & Safety:**
   Render methods (`renderNotices`, `renderMaintenance`, `renderBookings`, `renderComplaints`, and `updateOverviewWidgets`) inspect the DOM for their respective container classes (`.notices-list`, `.maintenance-list`, `.bookings-list`, `.complaints-list`). If a container does not exist on the current page fragment, the function exits safely without throwing errors.

#### 2. How Local Storage Writes Work Across Handlers

Each interactive module manages its own writes to `localStorage` under the shared key `rwa_local_data`:

- **Facility Bookings (`js/bookingHandle.js`):**
  When a resident completes the booking modal:
  1. Validates inputs (name, flat, event, guest count) and checks for time slot conflicts.
  2. Generates an ID: `BKG-${Date.now()}`.
  3. Reads existing `rwa_local_data` from `localStorage`, appends `local.bookings[id] = newEntry`, and writes back via `JSON.stringify()`.
  4. Updates in-memory `cachedBookings` and re-renders the calendar and slot list reactively without refreshing the page.

- **Maintenance Dues (`js/maintenanceHandle.js`):**
  When a payment is recorded via the "Pay Now" or "Record Payment" modal:
  1. Updates the flat's record: `status = ["paid", currentDate]`.
  2. Reads `rwa_local_data`, sets `localData.maintenance[flat] = updatedRecord`, and writes back to `localStorage`.
  3. Re-renders the maintenance cards, recalculates the 4 financial KPI aggregate metrics, and displays an official digital receipt with print support (`window.print()`).

- **Complaints (`js/complaintHandle.js`):**
  - **Filing a Complaint:** Computes the next ticket number (`CMP-006`), stamps the current date, sets status to `"open"`, updates `localData.complaints[newId]`, writes to `localStorage`, and prepends the card to the list.
  - **Status Progression:** Calling `toggleComplaintStatus(id)` cycles tickets through `"open"` → `"in_progress"` → `"resolved"` → `"open"`, immediately persisting the new state to `localStorage`.

---

### Theme System

**`js/theme_handle.js`** manages the light and dark theme experience:

- Checks `localStorage.getItem("theme")` on startup, falling back to the browser's `prefers-color-scheme` media query.
- Toggles the `.dark` class on the `<html>` root element, flipping all CSS custom property variables.
- The theme toggle button contains an asynchronous animation loop cycling through **7 SVG icon paths** at ~71ms intervals, creating a continuous morphing effect between sun and moon.
- The button is disabled during animation to prevent rapid-click race conditions.

---

### Mobile Menu

**`js/menu_btn.js`** handles responsive navigation on screens ≤650px:

- Toggles the `.open` class on the full-screen `#sidebar` drawer with smooth CSS slide transitions and a frosted-glass `backdrop-filter`.
- Morphs the three horizontal bars of the hamburger SVG into an ✕ using CSS rotation and scale transforms.
- Closes the sidebar with a 450ms delay after clicking a link so users can see the active indicator animation before dismissal.
- Listens to `window.matchMedia('(max-width: 650px)')` to automatically close the mobile drawer if the screen is resized wider.

---

### GitHub Pages Compatibility

Static web servers serve a default `404.html` on deep URLs. Neighbourly solves this with a two-step shim:

1. **`404.html` (root):** Extracts the target pathname, formats it as `/?path=%2Ftarget%2Froute`, and replaces the current URL via `location.replace()`. It automatically accounts for the GitHub repository sub-path (`/Project-RWA/`).
2. **`js/router.js`:** On initialization, checks for the `?path=` query parameter. If found, it immediately cleans the URL back to the standard pathname using `history.replaceState()` without reloading the page.

---

## Pages & Routes

Routes are configured in `config.json` and map URL paths to HTML fragments in `pages/`:

| Route | Fragment File | Status | Description |
|---|---|---|---|
| `/` | `pages/overview.html` | ✅ Done | Dashboard with society notice board and interactive overview widgets. |
| `/notices` | `pages/notices.html` | ✅ Done | Full-page notices board with priority badges. |
| `/maintenance` | `pages/maintenance.html` | ✅ Done | Dues ledger, financial KPI cards, live search, payment modal, and printable receipts. |
| `/booking` | `pages/booking.html` | ✅ Done | Club House & Party Lawn booking calendar, slot collision detection, and reservation modal. |
| `/complaints` | `pages/complaint.html` | ✅ Done | Grievance redressal, KPI counters, category filters, and complaint submission. |
| `/about` | `pages/about.html` | 🚧 In development | Society details and general information. |
| _(unknown routes)_ | `pages/404.html` | ✅ Done | Custom 404 page featuring an apartment SVG graphic. |

---

## Data Schema

### `data/data.json`

This file provides the initial baseline data representing the society state:

```jsonc
{
  "notices": {
    "<id>": {
      "priority-level": "high" | "medium" | "low",
      "heading": "string",
      "description": "string",
      "date": "DD-MM-YYYY"
    }
  },
  "maintenance": {
    "<flat-id>": {              // e.g. "A-101", "B-205"
      "resident": "string",
      "amount": number,
      "due_date": "DD-MM-YYYY",
      "status": ["paid" | "pending" | "overdue", "<date-or-note>"]
    }
  },
  "bookings": {
    "<booking-id>": {           // e.g. "BKG-001"
      "facility": "Club House" | "Party Lawn",
      "flat": "string",
      "resident": "string",
      "event_type": "string",
      "booking_date": "DD-MM-YYYY",
      "time_slot": "HH:MM - HH:MM",
      "guest_count": number,
      "payment_status": "paid" | "pending",
      "approval_status": "confirmed" | "awaiting_payment" | "rejected_*"
    }
  },
  "complaints": {
    "<complaint-id>": {         // e.g. "CMP-001"
      "flat": "string",
      "resident": "string",
      "category": "Plumbing" | "Electrical" | "Common Area" | "Sanitation" | "Noise" | "Security" | "Other",
      "title": "string",
      "description": "string",
      "priority": "low" | "medium" | "high",
      "status": "open" | "in_progress" | "resolved",
      "date": "DD-MM-YYYY"
    }
  }
}
```

### `localStorage` (`rwa_local_data`)

User-created records and status updates are saved under the `rwa_local_data` key with an identical schema structure:

```jsonc
{
  "notices": {},
  "maintenance": {
    "B-205": {
      "resident": "Neha",
      "amount": 2200,
      "due_date": "23-12-2026",
      "status": ["paid", "24-11-2026"]
    }
  },
  "bookings": {
    "BKG-1732456789000": {
      "facility": "Club House",
      "flat": "B-304",
      "resident": "Rahul Sharma",
      "event_type": "Family Gathering",
      "booking_date": "28-11-2026",
      "time_slot": "18:00 - 23:59",
      "guest_count": 25,
      "payment_status": "pending",
      "approval_status": "awaiting_payment"
    }
  },
  "complaints": {
    "CMP-006": {
      "flat": "C-201",
      "resident": "Priya Verma",
      "category": "Electrical",
      "title": "Corridor Light Failure",
      "description": "Corridor light fixture is sparking on the 3rd floor.",
      "priority": "high",
      "status": "open",
      "date": "24-11-2026"
    }
  }
}
```

---

## Styling System

`style.css` uses a **semantic CSS custom property** layer built on `oklch` perceptual color spaces:

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--sunken-color` | Lightest warm white | Darkest charcoal | Recessed backgrounds |
| `--page-color` | Warm white | Dark charcoal | Base page background |
| `--surface-color` | Slightly lighter off-white | Medium charcoal | Cards, panels, modals |
| `--raised-color` | Elevated white | Elevated charcoal | Buttons, controls, chips |
| `--overlay-color` | Pure white | Light charcoal | Dropdown menus, tooltips |
| `--ink-color` | Near-black | Near-white | Primary typography |
| `--accent-color` | Blue (`oklch 54.6%`) | Blue (`oklch 54.6%`) | Interactive links & highlights |

**Responsive Breakpoints:**

| Breakpoint | Behaviour |
|---|---|
| `≤ 1224px` | Nav text labels collapse; buttons show icons with hover tooltips. |
| `≤ 850px` | Resident/Admin toggle labels hidden (icons only). |
| `≤ 750px` | Overview grid stacks into a single-column layout. |
| `≤ 650px` | Desktop navigation bar hides; hamburger toggle and slide-in drawer activate. |
| `≤ 425px` | Role-toggle dashpill hides to prioritize branding title space. |

---

## Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/ujjwalaggarwa1/Project-RWA.git
cd Project-RWA

# 2. Install dependencies (Vite for local development)
npm install

# 3. Start the dev server (defaults to http://127.0.0.1:8000)
npx vite
```

The local development server is configured with a custom full-page reload plugin on file save (`vite.config.js`) so that routing state refreshes cleanly, mirroring production static-file hosting.

> **Tip:** The application runs completely without Vite. You can serve the repository using any local HTTP static server (e.g. `python -m http.server 8000` or the VS Code Live Server extension).

---

## Configuration

**`config.json`** is the single configuration source for application metadata and routing:

```json
{
  "name": "Neighbourly",
  "rootId": "content",
  "notFound": "404",
  "routes": {
    "/": "overview",
    "/notices": "notices",
    "/maintenance": "maintenance",
    "/booking": "booking",
    "/complaints": "complaint",
    "/about": "about"
  }
}
```

| Key | Purpose |
|---|---|
| `name` | Society/app name displayed in the navbar branding and document title. |
| `rootId` | ID of the DOM element where page fragments are injected (`#content`). |
| `notFound` | Fragment filename displayed for unrecognized URL paths (`404`). |
| `routes` | Key-value mapping of URL paths to fragment filenames inside `pages/`. |

---

## Authors

Built as a group project at **Lovely Professional University (LPU)**.

| Name | Role |
|---|---|
| **Ujjwal** | Lead Developer |
| **Anshul** | Contributor |
| **Mayank** | Contributor |
| **Manpreet** | Contributor |

*(For the curious: `git blame` tells its own story.)*

---

## Real Contributes

| Name | Role |
|---|---|
| **Ujjwal** | Lead Developer |
| **Vardan** | Contributor |

---

**Live:** [ujjwalaggarwa1.github.io/Project-RWA](https://ujjwalaggarwa1.github.io/Project-RWA) &nbsp;|&nbsp; **Repo:** [github.com/ujjwalaggarwa1/Project-RWA](https://github.com/ujjwalaggarwa1/Project-RWA)
