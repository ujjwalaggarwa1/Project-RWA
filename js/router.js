// Undo the 404.html redirect: /?path=%2Feg -> /eg (no new history entry)

// FIX: Use "." instead of "../" to get the current directory of router.js.
// This perfectly handles Localhost (/), Custom Domains (/), and Github Pages (/repo-name/)
// Note: If you ever move router.js into a subfolder (like /js/router.js), change this back to "../"
const BASE = new URL(".", import.meta.url).pathname;

// URL path without the base:  "/repo-name/notices" -> "/notices"
export function currentPath() {
    return location.pathname.slice(BASE.length - 1) || "/";
}

// App path with the base added:  "/notices" -> "/repo-name/notices"
export function withBase(path) {
    return BASE.slice(0, -1) + path;
}

const redirected = new URLSearchParams(location.search).get("path");
if (redirected) history.replaceState(null, "", withBase(redirected));

let config;
try {
    const response = await fetch(`${BASE}config.json`);
    if (!response.ok) throw new Error(`config.json: ${response.status}`);
    config = await response.json();
} catch (error) {
    console.error("Router could not load config:", error);
    config = { rootId: "app", notFound: "404", routes: {} }; // safe fallback
}

const { rootId, notFound, routes } = config;

let latestRequest = 0; // protection against slow responses

function page(file, parent_id) {
    const mine = ++latestRequest;
    return fetch(`${BASE}pages/${file}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`${file}.html: ${response.status}`);
            return response.text();
        })
        .then(html => {
            if (mine !== latestRequest) return; // a newer navigation won; drop this one
            document.getElementById(parent_id).innerHTML = html;
            setActive(); // buttons inside the new fragment now exist
        })
        .catch(error => {
            console.error("Error loading page:", error);
        });
}

// Strip 'active' from every nav element, then give it to the one matching the URL.
function setActive() {
    document.querySelectorAll("[data-link]").forEach(el => {
        const target = el.dataset.link || el.getAttribute("href");
        el.classList.toggle("active", target === currentPath());
    });
    updateIndicator();
}

// Measures the active nav button and hands its position/width to CSS as variables.
// CSS draws the underline and animates the move; JS only supplies the numbers.
function updateIndicator() {
    document.querySelectorAll(".pages").forEach(bar => {
        const active = bar.querySelector(".active");
        // A hidden container (display: none) measures as 0. Skip it; the
        // ResizeObserver below calls us again the moment it becomes visible.
        if (!active || bar.offsetWidth === 0) return;

        bar.style.setProperty("--x", `${active.offsetLeft}px`);
        bar.style.setProperty("--y", `${active.offsetTop}px`);
        bar.style.setProperty("--w", `${active.offsetWidth}px`);
        bar.style.setProperty("--h", `${active.offsetHeight}px`);

        // Enable the transition only after the first real placement, so the
        // line does not slide in from the corner when first shown.
        requestAnimationFrame(() => bar.classList.add("ready"));
    });
}

// Fires on window resize, on a hidden bar being revealed, and on content resizing.
const barObserver = new ResizeObserver(updateIndicator);
document.querySelectorAll(".pages").forEach(bar => barObserver.observe(bar));
document.fonts?.ready.then(updateIndicator); // text width can change once fonts load

// Reads the URL, never receives a path as an argument.
export function render() {
    setActive();
    const file = routes[currentPath()] ?? notFound;
    return page(file, rootId);
}

window.addEventListener("popstate", render); // back / forward buttons

render(); // first load, refresh, typed URL