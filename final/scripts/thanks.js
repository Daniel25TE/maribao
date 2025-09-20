import { setupMenuToggle } from './modules/menuToggle.js';
import { thanksdetails } from './modules/thanksdetails.js';
import { toggleContactList, openWhatsApp } from './modules/whatsapp.js';

document.addEventListener('DOMContentLoaded', () => {

    setupMenuToggle();
    thanksdetails();
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
