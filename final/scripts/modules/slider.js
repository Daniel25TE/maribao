// modules/slider.js

export function initializeSlider() {
    const sliderTrack = document.querySelector(".slider-track");
    const dotsContainer = document.querySelector(".slider-indicators");
    const leftBtn = document.querySelector(".slider-btn.left");
    const rightBtn = document.querySelector(".slider-btn.right");
    let currentIndex = 0;

    if (!sliderTrack || !dotsContainer) return;

    const totalImages = sliderTrack.children.length;

    // Create dots
    dotsContainer.innerHTML = Array.from({ length: totalImages }, (_, i) =>
        `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
    ).join('');

    const dots = document.querySelectorAll(".dot");

    // Dot click
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index);
            changeSlide(index);
        });
    });

    function changeSlide(index) {
        currentIndex = index;
        requestAnimationFrame(() => {
            sliderTrack.style.transform = `translateX(-${index * 100}%)`;
            updateDots();
        });
    }

    function updateDots() {
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });
    }

    function prevSlide() {
        if (currentIndex > 0) {
            changeSlide(currentIndex - 1);
        }
    }

    function nextSlide() {
        if (currentIndex < totalImages - 1) {
            changeSlide(currentIndex + 1);
        }
    }

    // Add listeners for shared nav buttons
    leftBtn?.addEventListener("click", prevSlide);
    rightBtn?.addEventListener("click", nextSlide);

    return { nextSlide, prevSlide };
}

export function createSlider(sliderContainer) {
    const track = sliderContainer.querySelector(".slider-track");
    const images = track.querySelectorAll("img");
    const totalSlides = images.length;
    let currentIndex = 0;

    const leftBtn = sliderContainer.querySelector(".slider-btn.left");
    const rightBtn = sliderContainer.querySelector(".slider-btn.right");
    const dotsContainer = sliderContainer.querySelector(".slider-indicators");

    // Crear dots dentro del contenedor
    if (dotsContainer) {
        dotsContainer.innerHTML = Array.from({ length: totalSlides }, (_, i) =>
            `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
        ).join('');
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll(".dot") : [];

    const updateSlider = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Actualizar dots activos
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });
    };

    // Evento click en cada dot para cambiar slide
    dots.forEach(dot => {
        dot.addEventListener("click", () => {
            const index = parseInt(dot.dataset.index);
            if (!isNaN(index)) {
                currentIndex = index;
                updateSlider();
            }
        });
    });

    // Botones de navegación
    leftBtn?.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

    rightBtn?.addEventListener("click", () => {
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
            updateSlider();
        }
    });

    updateSlider();
}
