// Undo the 404.html redirect: /?path=%2Feg -> /eg (no new history entry)

// DYNAMIC BASE EXTRACTION:
// This looks at the absolute script URL and cuts off the "/js/..." portion.
// It mathematically guarantees the correct root on Localhost (/), Custom Domains (/), and Github Pages (/repo-name/)
import { populate } from './data-loader.js';


const scriptPath = new URL(import.meta.url).pathname;
const BASE = scriptPath.substring(0, scriptPath.lastIndexOf('/js/')) + '/';

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

async function page(file, parent_id) {
    const mine = ++latestRequest;
    const container = document.getElementById(parent_id);

    // Briefly fade/hide the container while fetching
    if (container) container.style.opacity = "0";

    try {
        const response = await fetch(`${BASE}pages/${file}.html`);
        if (!response.ok) throw new Error(`${file}.html: ${response.status}`);
        const html = await response.text();

        if (mine !== latestRequest) return; // a newer navigation won; drop this one

        if (container) {
            container.innerHTML = html;
            // await populate();
        }

        // Wait for custom fonts to settle before measuring nav/layout
        if (document.fonts) await document.fonts.ready;

        setActive(); // buttons inside the new fragment now exist

        // Reveal the container cleanly once the DOM is injected
        if (container) {
            requestAnimationFrame(() => {
                container.style.opacity = "1";
            });
        }
    } catch (error) {
        console.error("Error loading page:", error);
    }
}

// Strip 'active' from every nav element, then give it to the one matching the URL.
function setActive() {
    document.querySelectorAll("[data-link]").forEach(el => {
        const target = el.dataset.link || el.getAttribute("href");
        el.classList.toggle("active", target === currentPath());
    });
    updateIndicator();
}

// Toggles footer visibility depending on whether the route ends with /about
function toggleFooter() {
    const footer = document.querySelector("footer");
    if (!footer) return;

    // Normalizes trailing slashes (e.g. "/about/" -> "/about")
    const cleanPath = currentPath().replace(/\/$/, "");
    footer.style.display = cleanPath.endsWith("/about") ? "none" : "";
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
    toggleFooter();
    setActive();
    const file = routes[currentPath()] ?? notFound;
    return page(file, rootId);
}

window.addEventListener("popstate", render); // back / forward buttons

render(); // first load, refresh, typed URL