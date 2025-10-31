import { highlightActiveLink } from './modules/header.js';
import { setupCTAObserver } from './modules/ctaObserver.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { toggleContactList, openWhatsApp } from './modules/whatsapp.js';
import { lazyLoadStaticContainers } from "./modules/lazyLoader.js";

document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();
    setupMenuToggle();
    lazyLoadStaticContainers();


    const cta = document.getElementById('cta');
    const header = document.querySelector('header');
    const weather = document.getElementById('weather-note');

    setupCTAObserver(cta, header, weather);

    const whatsappBtn = document.getElementById('whatsappBtn');
    const contactButtons = document.querySelectorAll('button.contact-item');


  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', toggleContactList);
  }

  contactButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const number = btn.dataset.number;
      openWhatsApp(number);
    });
  });
})