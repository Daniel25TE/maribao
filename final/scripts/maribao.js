import { highlightActiveLink } from './modules/header.js';
import { setupCTAObserver } from './modules/ctaObserver.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { loadOptions } from './modules/loadOptions.js';
import { loadRestaurants } from './modules/loadRestaurants.js';
import { initializeSlider } from './modules/slider.js';

document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();

    setupMenuToggle();
    loadOptions();
    loadRestaurants();
    const { nextSlide, prevSlide } = initializeSlider();

    document.getElementById("nextBtn")?.addEventListener("click", nextSlide);
    document.getElementById("prevBtn")?.addEventListener("click", prevSlide);

    const cta = document.getElementById('cta');
    const header = document.querySelector('header');

    setupCTAObserver(cta, header);
});
