import { highlightActiveLink } from './modules/header.js';
import { setupCTAObserver } from './modules/ctaObserver.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { lazyLoadStaticContainers } from "./modules/lazyLoader.js"
import { lazyLoadFooterIcons } from './modules/footerLazy.js';
import { toggleContactList, openWhatsApp } from './modules/whatsapp.js';
import { createVideoSlider } from './modules/story-videos.js';

import { loadGallery } from "./modules/galeria.js";

document.addEventListener("DOMContentLoaded", () => {
  const storyContainer = document.getElementById("home-video-container");

  if (storyContainer) {
        createVideoSlider(storyContainer);
    }
    highlightActiveLink();
    setupCTAObserver();
    setupMenuToggle();
    loadGallery();
  lazyLoadStaticContainers();
  loadHomeVideo();
    const cta = document.getElementById('cta');
    const header = document.querySelector('header');
    const weather = document.getElementById('weather-note');

    setupCTAObserver(cta, header, weather);
    lazyLoadFooterIcons();
    const whatsappBtn = document.getElementById('whatsappBtn');
  const contactButtons = document.querySelectorAll('#contactList button');

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', toggleContactList);
  }

  contactButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const number = btn.dataset.number;
      openWhatsApp(number);
    });
  });

 

});

async function loadHomeVideo() {
    const container = document.getElementById("home-video-container");

    if (!container) return;

    // --- 1️⃣ Colocar placeholders mientras cargan los videos ---
    container.innerHTML = `
        <button class="story-btn left">◀</button>
        <button class="story-btn right">▶</button>
        <div class="story-indicators"></div>
        <video controls muted autoplay width="400">
            <source src="videos/estrella.webm" type="video/webm">
        </video>
        <video controls muted autoplay width="400">
            <source src="videos/estrella.webm" type="video/webm">
        </video>
    `;

    // Inicializar slider con placeholders
    initializeStoryVideos(container);

    try {
        // --- 2️⃣ Traer videos reales del backend ---
        const res = await fetch("https://hotel-backend-3jw7.onrender.com/api/settings/home-video");
        const data = await res.json();
        console.log("home-video response:", data);

        if (!data.urls || !data.urls.length) return;

        // Limpiar contenedor y reconstruirlo con los videos reales
        container.innerHTML = `
            <button class="story-btn left">◀</button>
            <button class="story-btn right">▶</button>
            <div class="story-indicators"></div>
        `;

        data.urls.forEach(url => {
            const video = document.createElement("video");
            video.src = url;
            video.controls = true;
            video.muted = true; // puedes ajustar según quieras
            video.autoplay = true;
            video.width = 400;
            container.appendChild(video);
        });

        // Inicializar slider con los videos del backend
        initializeStoryVideos(container);

    } catch (err) {
        console.error("Error cargando videos home:", err);
    }
}


function initializeStoryVideos(container) {
    const videos = container.querySelectorAll("video");
    let currentIndex = 0;

    // --- 1️⃣ Crear indicadores dinámicamente ---
    let indicatorsContainer = container.querySelector(".story-indicators");
    if (!indicatorsContainer) {
        indicatorsContainer = document.createElement("div");
        indicatorsContainer.classList.add("story-indicators");
        container.appendChild(indicatorsContainer);
    }
    indicatorsContainer.innerHTML = "";
    videos.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.classList.add("story-dot");
        if (i === 0) dot.classList.add("active");
        dot.dataset.index = i;
        indicatorsContainer.appendChild(dot);

        dot.addEventListener("click", () => {
            currentIndex = i;
            showVideo(currentIndex);
        });
    });

    function showVideo(index) {
        videos.forEach((vid, i) => {
            vid.classList.toggle("active", i === index);
            if (i === index) {
                vid.style.display = "block";
                vid.play().catch(err => console.warn(err));
            } else {
                vid.style.display = "none";
                vid.pause();
                vid.currentTime = 0;
            }
        });

        // actualizar indicadores
        const dots = container.querySelectorAll(".story-dot");
        dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    }

    // --- 2️⃣ Flechas ---
    const leftBtn = container.querySelector(".story-btn.left");
    const rightBtn = container.querySelector(".story-btn.right");

    if (leftBtn) leftBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + videos.length) % videos.length;
        showVideo(currentIndex);
    });
    if (rightBtn) rightBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % videos.length;
        showVideo(currentIndex);
    });

    // --- 3️⃣ Auto siguiente ---
    videos.forEach((vid, i) => {
        vid.addEventListener("ended", () => {
            currentIndex = (currentIndex + 1) % videos.length;
            showVideo(currentIndex);
        });
    });

    // Mostrar el primer video
    showVideo(currentIndex);
}

