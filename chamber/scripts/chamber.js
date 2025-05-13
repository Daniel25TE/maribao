document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger-menu");
    const nav = document.querySelector("#animateme");

    hamburger.addEventListener("click", function () {
        nav.classList.toggle("active");
        hamburger.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
        if (!hamburger.contains(event.target) && !nav.contains(event.target)) {
            nav.classList.remove("active");
            hamburger.classList.remove("active");
        }
    });
});

const currentYear = new Date().getFullYear();
const currentYearElem = document.getElementById("year");
if (currentYearElem) {
    currentYearElem.textContent = currentYear;
}
document.getElementById("last-modified").textContent = `Last modified: ${document.lastModified}`;