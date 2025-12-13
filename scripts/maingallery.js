import { highlightActiveLink } from './modules/header.js';
import { setupCTAObserver } from './modules/ctaObserver.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { lazyLoadStaticContainers } from "./modules/lazyLoader.js"
import { lazyLoadFooterIcons } from './modules/footerLazy.js';
import { toggleContactList, openWhatsApp } from './modules/whatsapp.js';

import { loadGallery } from "./modules/galeria.js";

document.addEventListener("DOMContentLoaded", () => {
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
     console.log("loadHomeVideo ejecutándose");
    try {
        const res = await fetch("https://hotel-backend-3jw7.onrender.com/api/settings/home-video");
        const data = await res.json();
        console.log("home-video response:", data);
        if (!data.urls || !data.urls.length) return;

        const container = document.getElementById("home-video-container");
        if (!container) return;

        container.innerHTML = ""; // limpiar videos anteriores

        data.urls.forEach(url => {
            const video = document.createElement("video");
            video.src = url;
            video.controls = true;
            video.width = 400;
            container.appendChild(video);
        });
      console.log("container:", container);
    } catch (err) {
        console.error("Error cargando videos home:", err);
    }
}
