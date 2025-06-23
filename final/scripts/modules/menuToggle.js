export function setupMenuToggle() {
    const hamburger = document.querySelector(".hamburger-menu");
    const nav = document.querySelector("nav");
    if (!hamburger || !nav) return;

    hamburger.addEventListener("click", () => {
        nav.classList.toggle("active");
        hamburger.classList.toggle("active");
        hamburger.textContent = hamburger.classList.contains("active") ? "✖" : "☰";
    });

    document.addEventListener("click", (e) => {
        if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
            nav.classList.remove("active");
            hamburger.classList.remove("active");
            hamburger.textContent = "☰";
        }
    });
}