import { highlightActiveLink } from './modules/header.js';
import { setupCTAObserver } from './modules/ctaObserver.js';
import { setupMenuToggle } from './modules/menuToggle.js';
import { loadOptions } from './modules/loadOptions.js';
import { loadRestaurants } from './modules/loadRestaurants.js';
import { initializeSlider } from './modules/slider.js';
import { allVideos } from "./modules/videos.js";
import { allheroimages } from './modules/heroimages.js';
import { lazyLoadStaticContainers } from "./modules/lazyLoader.js";
import { loadQuestions } from './modules/somequestions.js';
import { cargarComentarios } from './modules/comentariosmostrar.js';
import { toggleContactList, openWhatsApp } from './modules/whatsapp.js';

document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();
    setupMenuToggle();
    loadOptions();
    loadRestaurants();
    lazyLoadStaticContainers();
    allheroimages();
    loadQuestions();
  cargarComentarios();
  loadHomeVideo();


    

    const { nextSlide, prevSlide } = initializeSlider();

    document.getElementById("nextBtn")?.addEventListener("click", nextSlide);
    document.getElementById("prevBtn")?.addEventListener("click", prevSlide);

    const cta = document.getElementById('cta');
    const header = document.querySelector('header');
    const weather = document.getElementById('weather-note');

    setupCTAObserver(cta, header, weather);
    // Lazy load del módulo de videos
    const sliderSection = document.querySelector('#video-slider');

    if (sliderSection) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    sliderSection.classList.add('visible');
                    import('./modules/videos.js')
                        .then(({ allVideos }) => {
                            allVideos();
                        })
                        .catch(err => console.error("Error al cargar videos.js:", err));

                    observer.unobserve(entry.target); // Solo cargar una vez
                }
            });
        }, {
            rootMargin: '200px', // Carga anticipada para mejorar UX
        });

        observer.observe(sliderSection);
    }
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


  async function loadHomeVideo() {
    try {
        const res = await fetch("/api/settings/home-video");
        const data = await res.json();

        if (!data.url) return;

        const video = document.getElementById("home-video");
        if (!video) return;

        video.src = data.url;
        video.load();
    } catch (err) {
        console.error("Error cargando video home:", err);
    }
}


});
