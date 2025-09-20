import { highlightActiveLink } from './modules/header.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { loadRooms } from './modules/loadRooms.js';
import { lazyLoadStaticContainers } from "./modules/lazyLoader.js";
import { toggleContactList, openWhatsApp } from './modules/whatsapp.js';
document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();

    setupMenuToggle();
    loadRooms();
    lazyLoadStaticContainers();
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
