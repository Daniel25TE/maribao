import { places } from "../data/places.mjs";
console.log(places)
const visitsDisplay = document.querySelector(".visits");
if (visitsDisplay) {
    let numVisits = Number(window.localStorage.getItem("numVisits-ls")) || 0;
    let lastVisit = window.localStorage.getItem("lastVisit-ls");
    const currentDate = new Date();
    if (!lastVisit) {
        visitsDisplay.textContent = `Welcome! Let us know if you have any questions.`;
    } else {
        const lastVisitDate = new Date(lastVisit);
        const timeDifferenceInMs = currentDate - lastVisitDate;
        const daysBetweenVisits = Math.floor(timeDifferenceInMs / (1000 * 3600 * 24));

        if (daysBetweenVisits < 1) {
            visitsDisplay.textContent = `Back so soon! Awesome!`;
        } else {
            const dayText = daysBetweenVisits === 1 ? "day" : "days";
            visitsDisplay.textContent = `You last visited ${daysBetweenVisits} ${dayText} ago.`;
        }
    }
    numVisits++;
    localStorage.setItem("numVisits-ls", numVisits);

    window.localStorage.setItem("lastVisit-ls", currentDate.toISOString());
    setTimeout(() => {
        visitsDisplay.classList.add('hide');
    }, 5000);
} else {
    console.log("No '.visits' element found, skipping visit count logic.");
}
function setupMenuToggle() {
    const menuToggle = document.querySelector("#menu-toggle");
    const nav = document.querySelector("nav");

    menuToggle.addEventListener("click", () => {
        nav.classList.toggle("active");
        menuToggle.textContent = nav.classList.contains("active") ? "✖" : "☰";
    });
}
function updateFooter() {
    const launchYearEl = document.getElementById("launchYear");
    const lastModifiedEl = document.getElementById("lastModified");

    if (launchYearEl && lastModifiedEl) {
        launchYearEl.textContent = new Date().getFullYear();
        lastModifiedEl.textContent = document.lastModified;
    }
}
updateFooter();
setupMenuToggle();
function renderCards() {
    const container = document.getElementById("cards-container");

    places.forEach(place => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
        
      <img 
        src="${place.photo_url}" 
        alt="${place.name}" 
        loading ="lazy"
        >
        
      <h2>${place.name}</h2>
      
      <address>${place.address}</address>
      <p>${place.description}</p>
      <button onclick="window.location.href='${place.learnMoreLink}'">Learn More</button>
    `;

        container.appendChild(card);
    });
}

window.onload = renderCards;

