import { createVideoSlider } from "./slider-videos.js";

export async function allVideos() {
  try {
    const res = await fetch("data/videos.json");
    const data = await res.json();

    const container = document.getElementById("video-slider");
    if (!container) return;

    const sliderTrack = container.querySelector(".slider-videos-track");
    if (!sliderTrack) return;

    data.forEach(video => {
      const card = document.createElement("article");
      card.classList.add("video-card");
      card.innerHTML = `
        <h2>${video.title}</h2>
        <video controls poster="${video.poster}" loading="lazy" preload="none">
          <source src="${video.src}" type="video/webm">
          <track default kind="captions" srclang="es">
          Tu navegador no soporta el video.
        </video>
      `;
      sliderTrack.appendChild(card);
    });

    createVideoSlider(container);
  } catch (err) {
    console.error("Error cargando videos:", err);
  }
}

