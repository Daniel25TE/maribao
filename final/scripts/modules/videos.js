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
        <video playsinline webkit-playsinline autoplay muted loop poster="${video.poster}" loading="lazy" preload="none">
          <source src="${video.src}" type="video/webm">
          <track default kind="captions" srclang="es">
          Tu navegador no soporta el video.
        </video>
        <button class="play-pause-btn" aria-label="Reproducir o pausar video">
  <svg class="icon" viewBox="0 0 24 24" fill="white" width="24" height="24">
    <path d="M8 5v14l11-7z" class="play-icon" style="display: none;" />
    <path d="M6 19h4V5H6zm8-14v14h4V5h-4z" class="pause-icon" />
  </svg>
</button>


      `;
      sliderTrack.appendChild(card);
    });

    createVideoSlider(container);
  } catch (err) {
    console.error("Error cargando videos:", err);
  }
}

