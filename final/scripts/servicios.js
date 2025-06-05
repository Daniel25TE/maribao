import { highlightActiveLink } from './modules/header.js';
import { setupCTAObserver } from './modules/ctaObserver.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { loadOptions } from './modules/loadOptions.js';
import { loadRestaurants } from './modules/loadRestaurants.js';
import { loadPreguntas } from './modules/loadPreguntas.js';

document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();
    loadPreguntas();
    setupMenuToggle();
    loadOptions();
    loadRestaurants();


    const cta = document.getElementById('cta');
    const header = document.querySelector('header');

    setupCTAObserver(cta, header);
});