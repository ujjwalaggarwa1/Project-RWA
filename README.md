# Neighbourly — Resident Welfare Association Portal

> A lightweight, zero-framework SPA (Single Page Application) for managing a residential society — notices, maintenance dues, facility bookings, complaints, and more.

> **University Project** — Lovely Professional University (LPU). Frontend-only by design; backend behaviour is simulated using predefined static JSON data and `localStorage`.

---

## Table of Contents

- [Neighbourly — Resident Welfare Association Portal](#neighbourly--resident-welfare-association-portal)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Folder Structure](#folder-structure)
  - [Architecture](#architecture)
    - [SPA Router](#spa-router)
    - [Navigation](#navigation)
    - [Data Layer \& Backend Simulation](#data-layer--backend-simulation)
    - [Theme System](#theme-system)
    - [Mobile Menu](#mobile-menu)
    - [GitHub Pages Compatibility](#github-pages-compatibility)
  - [Pages \& Routes](#pages--routes)
  - [Data Schema](#data-schema)
    - [`data/data.json`](#datadatajson)
  - [Styling System](#styling-system)
  - [Running Locally](#running-locally)
  - [Configuration](#configuration)
  - [Authors](#authors)

---

## Overview

**Neighbourly** is a **frontend-only** web portal built as a university project at Lovely Professional University (LPU). It simulates a full Resident Welfare Association (RWA) management system — notices, maintenance dues, facility bookings, and complaints — without any real backend server.

Since this is a university project, backend behaviour is emulated in two ways:

- **Static JSON data** (`data/data.json`) acts as a predefined API response, representing the society's current state (notices, dues, bookings). This is what a real server would return.
- **`localStorage`** is used to simulate new entries being added by residents or admins. Any entry created through the UI is saved to the browser and merged with the static data on every page load — so additions persist across sessions without any server.

The app is built as a **vanilla JS SPA** using the browser's native `History API` for routing. Pages are HTML fragments fetched on demand and injected into a single shell (`index.html`), giving the feel of a multi-page app without full page reloads.

---

## Features

| Feature | Description |
|---|---|
| 📋 **Notices Board** | Society announcements with priority levels (high / medium / low) color-coded visually |
| 🔧 **Maintenance Dues** | Flat-wise payment status (paid, pending, overdue) |
| 📅 **Facility Bookings** | View bookings for Club House, Party Lawn, etc. with approval status |
| 🛠️ **Complaints** | Register and track resident complaints *(page in development)* |
| 🧮 **Fee Calculator** | Utility to calculate maintenance fees *(page in development)* |
| 👤 **Resident / Admin Toggle** | UI pill to switch between resident and admin views |
| 🌙 **Dark / Light Theme** | Animated icon transition through 7 SVG states; preference persisted in `localStorage` |
| 📱 **Fully Responsive** | Collapsible sidebar navigation on mobile (≤650px), tooltips on medium screens |
| ⚡ **SPA Navigation** | Zero full-page reloads; browser back/forward buttons work correctly |
| 💾 **localStorage Simulation** | New entries created in the UI are saved locally and merged with static data |
| 🌐 **GitHub Pages Ready** | Custom `404.html` redirect trick for deep-link support on static hosts |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Vanilla JavaScript (ES Modules) |
| Styling | Custom CSS (CSS custom properties, `oklch` colors, `@keyframes`) |
| Fonts | Google Fonts — Poppins, Goldman, Nunito, Short Stack, Noto Serif Dives Akuru |
| Icons | Inline SVG (Lucide icon set) |
| Dev Server | [Vite](https://vitejs.dev/) (dev only — no bundling used in the final output) |
| Data ("Backend") | Static JSON files + `localStorage` for simulated additions |
| Hosting | GitHub Pages / any static file host |

> **Note:** Vite is used **only as a development server** with hot-reload (full-page reload on save). The project does **not** use any Vite build pipeline, bundlers, or transpilers — the source files are served as-is.

---

## Folder Structure

```
Project-RWA/
│
├── index.html            # App shell — nav, sidebar, content mount point, scripts
├── 404.html              # GitHub Pages SPA redirect shim
├── style.css             # All application styles (single file, ~916 lines)
├── favicon.ico           # Site favicon
├── config.json           # Site name + route-to-file mapping
│
├── pages/                # HTML page fragments (loaded dynamically by the router)
│   ├── overview.html     # Dashboard / home page
│   ├── notices.html      # Notices listing page
│   ├── maintenance.html  # Maintenance dues page       ← in development
│   ├── fee.html          # Fee calculator page         ← in development
│   ├── booking.html      # Bookings page               ← in development
│   ├── complaint.html    # Complaints page             ← in development
│   ├── about.html        # About / info page
│   └── 404.html          # Not-found fragment (custom SVG illustration)
│
├── js/                   # All JavaScript modules
│   ├── router.js         # SPA router — fetches & renders page fragments
│   ├── navigate.js       # Click-delegation navigation + pushState wrapper
│   ├── data-loader.js    # Fetches data.json, merges localStorage, renders lists
│   ├── theme_handle.js   # Dark/light theme toggle with animated SVG icon
│   └── menu_btn.js       # Mobile hamburger menu open/close logic
│
├── data/                 # Static data files (simulate API responses)
│   ├── data.json         # Notices, maintenance dues, bookings (predefined data)
│   └── admin-data.json   # Admin-specific data (reserved / empty)
│
├── assets/               # Static assets
│   └── apartment.svg     # SVG illustration used in the 404 page
│
├── vite.config.js        # Vite dev server config (port 8000, full-reload plugin)
├── package.json          # npm metadata + Vite dependency
│
├── input.css             # Legacy CSS (reference only, not in use)
├── output.css            # Legacy CSS (reference only, not in use)
└── readme_extra.md       # Note about legacy CSS files
```

---

## Architecture

### SPA Router

**`js/router.js`** is the heart of the application.

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

- **Dynamic base extraction** — The router reads its own script URL (`import.meta.url`) to calculate the deployment base path. This makes it work without changes on `localhost`, custom domains, and GitHub Pages sub-paths (e.g. `/Project-RWA/`).
- **Race condition guard** — A `latestRequest` counter ensures that if two navigations fire in quick succession, only the last response wins; stale responses are silently dropped.
- **Animated active indicator** — CSS `--x`, `--y`, `--w`, `--h` custom properties are set by JS to position an animated underline/indicator bar under the active nav button. A `ResizeObserver` keeps it accurate on resize.
- **Footer toggling** — The footer is hidden on the `/about` route automatically.
- **Font-ready reveal** — `document.fonts.ready` is awaited before showing content to prevent layout shifts from late-loading Google Fonts.

---

### Navigation

**`js/navigate.js`** handles all in-app link clicks via **event delegation** on `document`.

Any element with a `data-link` attribute (button or anchor) triggers navigation:
```html
<a href="/notices" data-link>Notices</a>
<button data-link="/about">About</button>
```

The module wraps `history.pushState` and manually calls `render()` since `pushState` does not fire a `popstate` event. The browser's native back/forward buttons are handled by a `popstate` listener in `router.js`.

---

### Data Layer & Backend Simulation

**`js/data-loader.js`** exports a single `populate()` function called after every page load. This module is the core of the project's backend simulation strategy.

Data flow:
```
data/data.json  ──┐  (predefined "API" data — simulates a server response)
                  ├──►  merge (localStorage wins on ID collision)  ──►  render into DOM
localStorage    ──┘  (user-added entries — simulates a database write)
```

- **`data/data.json`** acts as the static "server response" — it holds all predefined notices, maintenance records, and bookings, exactly as a real REST API would return them.
- **`localStorage`** (key: `rwa_local_data`) simulates the write side of a backend. When a resident or admin adds a new entry through the UI, it is saved here. On every page load, local entries are merged with the static data, with `localStorage` taking precedence on ID collisions.
- Three render functions (`renderNotices`, `renderMaintenance`, `renderBookings`) each look for their container in the currently loaded page fragment and do nothing if absent — safe to call on every route change.

This two-layer approach lets the project demonstrate full CRUD-like behaviour (read from static data, write to `localStorage`) entirely in the browser with no server required.

---

### Theme System

**`js/theme_handle.js`** implements a polished dark/light mode toggle.

- Reads `localStorage` on init; falls back to `prefers-color-scheme` media query.
- Applies/removes the `.dark` class on `<html>`, which flips all CSS custom properties.
- The toggle button icon animates through **7 distinct SVG states** (moon → sun, with intermediate glyphs) at ~71ms per frame, creating a smooth morphing effect.
- The button is `disabled` during animation to prevent rapid-clicking artifacts.

---

### Mobile Menu

**`js/menu_btn.js`** manages the hamburger menu for screens ≤650px.

- Toggles `.open` on the `#sidebar` element (CSS slides it in from the right with a `translateX` transition and a frosted-glass `backdrop-filter`).
- The hamburger SVG morphs into an ✕ using CSS `transform` on its three `<path>` elements.
- After a nav link is clicked inside the sidebar, the menu closes with a 450ms delay (so the user can see the active indicator animate before closing).
- A `matchMedia` listener auto-closes the sidebar if the viewport widens past 650px.

---

### GitHub Pages Compatibility

Static hosts like GitHub Pages serve a `404.html` for any unknown URL. The project uses a two-part trick:

1. **`404.html` (root)** — Redirects the browser to `/?path=/the/original/path` without adding a history entry (`location.replace`). It detects if running on a GitHub Pages project site (`.github.io` hostname) and accounts for the repo-name base path.

2. **`router.js`** — On startup, reads the `?path=` query parameter and immediately calls `history.replaceState` to restore the real URL without a reload.

This means deep-links like `https://user.github.io/Project-RWA/notices` work correctly even on a static host.

---

## Pages & Routes

Routes are defined in `config.json` and map URL paths to HTML fragment files in `pages/`:

| Route | Fragment File | Status |
|---|---|---|
| `/` | `pages/overview.html` | 🚧 In development |
| `/notices` | `pages/notices.html` | ✅ Done |
| `/maintenance` | `pages/maintenance.html` | 🚧 In development |
| `/fee-calculator` | `pages/fee.html` | 🚧 In development |
| `/booking` | `pages/booking.html` | ✅ Done |
| `/complaints` | `pages/complaint.html` | 🚧 In development |
| `/about` | `pages/about.html` | 🚧 In development |
| *(any unknown route)* | `pages/404.html` | ✅ Done |

> **Note:** Pages marked 🚧 currently render only a placeholder text. Full UI for those sections is yet to be built.

---

## Data Schema

### `data/data.json`

This file acts as the simulated API response. Edit it to change the predefined society data shown in the app.

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
    "<flat-id>": {              // e.g. "A-101"
      "resident": "string",
      "amount": number,
      "due_date": "DD-MM-YYYY",
      "status": ["paid" | "pending" | "overdue", "<optional-date-or-note>"]
    }
  },
  "bookings": {
    "<booking-id>": {           // e.g. "BKG-001"
      "facility": "string",
      "flat": "string",
      "resident": "string",
      "event_type": "string",
      "booking_date": "DD-MM-YYYY",
      "time_slot": "HH:MM - HH:MM",
      "guest_count": number,
      "payment_status": "paid" | "pending",
      "approval_status": "confirmed" | "awaiting_payment" | "rejected_*"
    }
  }
}
```

User-added entries via the UI follow the same schema and are stored under the `rwa_local_data` key in `localStorage`.

---

## Styling System

`style.css` uses a **semantic CSS custom property** layer:

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `--sunken-color` | lightest warm white | darkest charcoal | Recessed surfaces |
| `--page-color` | warm white | dark charcoal | Base page background |
| `--surface-color` | slightly lighter | slightly lighter | Card/panel surfaces |
| `--raised-color` | lighter still | lighter still | Elevated UI elements |
| `--overlay-color` | pure white | lightest charcoal | Topmost elements |
| `--ink-color` | near-black | near-white | Primary text |
| `--accent-color` | blue (`oklch 54.6%`) | *(same)* | Interactive accent |

Colors are defined in **`oklch` color space** for perceptual uniformity across light and dark variants.

**Responsive breakpoints:**

| Breakpoint | Behaviour |
|---|---|
| `≤ 1224px` | Nav text labels hidden; icons only with CSS tooltips on hover |
| `≤ 850px` | Dashpill role-toggle labels hidden |
| `≤ 750px` | Overview switches to single-column grid |
| `≤ 650px` | Top nav hidden; hamburger menu + sidebar activated |
| `≤ 425px` | Resident/Admin toggle pill hidden |

---

## Running Locally

```bash
# Install Vite (only dev dependency)
npm install

# Start the dev server at http://127.0.0.1:8000
npx vite
```

The dev server is configured for **full-page reload** on every file save (Vite's default HMR is disabled) so that the router always starts fresh — matching the production static-file behavior.

> **Tip:** The app works without Vite too — just serve the project root with any static file server (e.g. `npx serve .` or VS Code Live Server). Vite is only needed for the convenient dev experience.

---

## Configuration

**`config.json`** is the single source of truth for site identity and routing:

```json
{
    "name": "Neighbourly",
    "rootId": "content",
    "notFound": "404",
    "routes": {
        "/": "overview",
        "/notices": "notices",
        "/maintenance": "maintenance",
        "/fee-calculator": "fee",
        "/booking": "booking",
        "/complaints": "complaint",
        "/about": "about"
    }
}
```

| Key | Purpose |
|---|---|
| `name` | Society/app name displayed in the navbar and page titles |
| `rootId` | ID of the DOM element where page fragments are injected |
| `notFound` | Fragment filename to show for unrecognized routes |
| `routes` | Map of URL path → HTML fragment filename (without `.html`) |

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

**Live:** [ujjwalaggarwa1.github.io/Project-RWA](https://ujjwalaggarwa1.github.io/Project-RWA) &nbsp;|&nbsp; **Repo:** [github.com/ujjwalaggarwa1/Project-RWA](https://github.com/ujjwalaggarwa1/Project-RWA)
