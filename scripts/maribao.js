const currentYear = new Date().getFullYear();
document.getElementById('currentyear').textContent = currentYear;

const currentYearMobile = new Date().getFullYear();
document.getElementById('currentyear-mobile').textContent = currentYearMobile;

const lastModified = document.lastModified;
document.getElementById('lastModified').textContent = `Last Modified: ${lastModified}`;

document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navigation = document.querySelector(".navigation");

    hamburger.addEventListener("click", function () {
        navigation.classList.toggle("active");
    });
});