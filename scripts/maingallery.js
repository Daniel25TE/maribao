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

    // --- 1️⃣ Colocar un placeholder con un solo <video> en el DOM desde el inicio ---
    container.innerHTML = `
    <div class="story-wrapper">
    
    <h2 class="story-h2">Esta semana...</h2>
    
    <div class="story-container">
        <video id="homeVideo" muted autoplay playsinline controls>
            <source src="videos/maribao-story-video.mp4" type="video/webm">
        </video>      
    </div>
    <div class="story-indicators"></div>
    </div>
    
    `;

    // Tomamos referencia al video
    const video = document.getElementById("homeVideo");

    // Inicializamos slider con el placeholder
    

    try {
        // --- 2️⃣ Traer videos reales del backend ---
        const res = await fetch("https://hotel-backend-3jw7.onrender.com/api/settings/home-video");
        const data = await res.json();
        console.log("home-video response:", data);

        if (!data.urls || !data.urls.length) return;

        // Limpiamos indicadores y preparamos los videos reales
        const indicatorsContainer = container.querySelector(".story-indicators");
        indicatorsContainer.innerHTML = "";

        // Solo reemplazamos el src del video existente para que autoplay funcione
        video.src = data.urls[0]; // primer video del backend
        video.load();
        video.play().catch(err => console.warn(err));

        const storyContainerDiv = container.querySelector(".story-container");

for (let i = 1; i < data.urls.length; i++) {
    const v = document.createElement("video");
    v.src = data.urls[i];
    v.muted = true;
    v.autoplay = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.controls = true;

    // 🔹 NO usar width fijo
    v.style.width = "100%";
    v.style.height = "100%";
    v.style.objectFit = "cover";

    storyContainerDiv.appendChild(v);
}



        // Re-inicializamos la slider para incluir todos los videos
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
        vid.pause();
        vid.currentTime = 0;
        vid.style.display = "none";
        vid.classList.remove("active");
    });

    const currentVideo = videos[index];
    currentVideo.style.display = "block";
    currentVideo.classList.add("active");
    currentVideo.play().catch(() => {});

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