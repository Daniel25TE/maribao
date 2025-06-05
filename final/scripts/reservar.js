import { highlightActiveLink } from './modules/header.js';
import { setupCTAObserver } from './modules/ctaObserver.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { loadRooms } from './modules/loadRooms.js';

document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();

    setupMenuToggle();
    loadRooms();

    const cta = document.getElementById('cta');
    const header = document.querySelector('header');

    setupCTAObserver(cta, header);
});
