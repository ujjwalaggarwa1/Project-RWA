const btn = document.getElementById('menu-btn');
const svg = document.getElementById('menu-svg');
const sidebar = document.getElementById('sidebar');

function setOpen(open) {
    svg.classList.toggle('open', open);
    sidebar.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
}

const CLOSE_DELAY = 450;   // a little time delay to see the sidebar active underline moving
let closeTimer;

btn.addEventListener('click', () => {
    clearTimeout(closeTimer);
    setOpen(!sidebar.classList.contains('open'));
});


sidebar.addEventListener('click', event => {
    if (!event.target.closest('[data-link]')) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => setOpen(false), CLOSE_DELAY);
});


window.matchMedia('(max-width: 650px)').addEventListener('change', event => {
    if (!event.matches) {
        clearTimeout(closeTimer);
        setOpen(false);
    }
});