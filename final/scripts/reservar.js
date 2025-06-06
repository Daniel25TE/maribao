import { highlightActiveLink } from './modules/header.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { loadRooms } from './modules/loadRooms.js';

document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();

    setupMenuToggle();
    loadRooms();

});
