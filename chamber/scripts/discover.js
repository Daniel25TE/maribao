import { places } from "../data/places.mjs";
console.log(places)
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
        srcset="${place.photo_url} 300w, ${place.photo_url_large} 600w, ${place.photo_url_x2} 900w" 
        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 900px"
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