import { dataForm } from './modules/dataForm.js';
import { toggleContactList, openWhatsApp } from './modules/whatsapp.js';

import { setupMenuToggle } from './modules/menuToggle.js';


document.addEventListener('DOMContentLoaded', () => {
    dataForm()
    setupMenuToggle();
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
