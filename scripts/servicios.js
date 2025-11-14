import { highlightActiveLink } from './modules/header.js';
import { setupCTAObserver } from './modules/ctaObserver.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { loadOptions } from './modules/loadServices.js';
import { allRestaurants } from './modules/allRestaurantes.js';
import { loadPreguntas } from './modules/loadPreguntas.js';
import { lazyLoadStaticContainers } from "./modules/lazyLoader.js";
import { toggleContactList, openWhatsApp } from './modules/whatsapp.js';


document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();
    loadPreguntas();
    setupMenuToggle();
    loadOptions();
    allRestaurants();
    lazyLoadStaticContainers();

    const cta = document.getElementById('cta');
    const header = document.querySelector('header');
    const weather = document.getElementById('weather-note');

    setupCTAObserver(cta, header, weather);
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