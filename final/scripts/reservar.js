import { highlightActiveLink } from './modules/header.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { loadRooms } from './modules/loadRooms.js';
import { lazyLoadStaticContainers } from "./modules/lazyLoader.js"
document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();

    setupMenuToggle();
    loadRooms();
    lazyLoadStaticContainers();

});
