// final/scripts/main.js
import { highlightActiveLink } from './modules/header.js';
import { setupCTAObserver } from './modules/ctaObserver.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { lazyLoadStaticContainers } from "./modules/lazyLoader.js"
import { lazyLoadFooterIcons } from './modules/footerLazy.js';


import { loadGallery } from "./modules/gallery.js";

document.addEventListener("DOMContentLoaded", () => {
    highlightActiveLink();
    setupCTAObserver();
    setupMenuToggle();
    loadGallery();
    lazyLoadStaticContainers();
    const cta = document.getElementById('cta');
    const header = document.querySelector('header');
    const weather = document.getElementById('weather-note');

    setupCTAObserver(cta, header, weather);
    lazyLoadFooterIcons();


});
