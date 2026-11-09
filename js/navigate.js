import { render, currentPath, withBase } from "./router.js";

export function navigate(path) {
    // Sanitize: ensure path always starts with a slash to prevent "/repoabout" bugs
    const safePath = path.startsWith("/") ? path : "/" + path;
    
    if (safePath === currentPath()) return;           // already here, nothing to do
    history.pushState(null, "", withBase(safePath));  // add the repo base, no reload
    render();                                         // pushState fires no event, so call it ourselves
}

// One listener for every link/button on the site.
// Usage in HTML: <a href="/about" data-link>About</a>
//             or: <button data-link="/about">About</button>
document.addEventListener("click", event => {
    const el = event.target.closest("[data-link]");
    if (!el) return;
    
    event.preventDefault();
    
    // getAttribute is critical here: el.href would return the full absolute URL 
    // (https://domain.com/path), but we strictly want the relative HTML string.
    const targetPath = el.dataset.link || el.getAttribute("href");
    
    if (targetPath) {
        navigate(targetPath);
    }
});