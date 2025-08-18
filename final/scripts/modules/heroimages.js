import { createSlider } from "./slider.js";

export async function allheroimages() {
    try {
        const res = await fetch("data/heroimages.json");
        const data = await res.json();

        const container = document.getElementById("hero-image");
        if (!container) return;

        const sliderTrack = container.querySelector(".slider-track");
        if (!sliderTrack) return;

        data.forEach(image => {
            const card = document.createElement("article");
            card.classList.add("image-card");
            card.innerHTML = `
        
        <img src="${image.src}" srcset="${image.srcset}" sizes="${image.sizes}" alt="${image.alt}" width="${image.width}" height="${image.height}">

      `;
            sliderTrack.appendChild(card);
        });

        createSlider(container);
    } catch (err) {
        console.error("Error cargando videos:", err);
    }
}
