// Undo the 404.html redirect: /?path=%2Feg -> /eg (no new history entry)
const redirected = new URLSearchParams(location.search).get("path");
if (redirected) history.replaceState(null, "", redirected);

let config;
try {
    const response = await fetch("/config.json");
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
    return fetch(`/pages/${file}.html`)
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
        el.classList.toggle("active", target === location.pathname);
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
    const file = routes[location.pathname] ?? notFound;
    return page(file, rootId);
}

window.addEventListener("popstate", render); // back / forward buttons

render(); // first load, refresh, typed URL