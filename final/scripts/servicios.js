import { highlightActiveLink } from './modules/header.js';
import { setupCTAObserver } from './modules/ctaObserver.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { loadOptions } from './modules/loadServices.js';
import { allRestaurants } from './modules/allRestaurantes.js';
import { loadPreguntas } from './modules/loadPreguntas.js';

document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();
    loadPreguntas();
    setupMenuToggle();
    loadOptions();
    allRestaurants();


    const cta = document.getElementById('cta');
    const header = document.querySelector('header');
    const weather = document.getElementById('weather-note');

    setupCTAObserver(cta, header, weather);
});