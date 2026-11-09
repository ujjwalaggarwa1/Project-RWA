
import { render } from "./router.js";

export function navigate(path) {
    if (path === location.pathname) return;   // already here, nothing to do
    history.pushState(null, "", path);        // change URL, no reload
    render();                                 // pushState fires no event, so call it ourselves
}

// One listener for every link/button on the site.
// Usage in HTML: <a href="/about" data-link>About</a>
//            or: <button data-link="/about">About</button>
document.addEventListener("click", event => {
    const el = event.target.closest("[data-link]");
    if (!el) return;
    event.preventDefault();
    navigate(el.dataset.link || el.getAttribute("href"));
});