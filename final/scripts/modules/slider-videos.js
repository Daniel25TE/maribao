// modules/slider-videos.js

export function createVideoSlider(sliderContainer) {
    const track = sliderContainer.querySelector(".slider-videos-track");
    if (!track) return;

    const mediaItems = track.querySelectorAll("video, img");
    const totalSlides = mediaItems.length;
    let currentIndex = 0;

    const leftBtn = sliderContainer.querySelector(".slider-videos-btn.left");
    const rightBtn = sliderContainer.querySelector(".slider-videos-btn.right");
    const dotsContainer = sliderContainer.querySelector(".slider-videos-indicators");

    if (dotsContainer) {
        dotsContainer.innerHTML = Array.from({ length: totalSlides }, (_, i) =>
            `<span class="video-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
        ).join('');
    }
    const dots = dotsContainer ? dotsContainer.querySelectorAll(".video-dot") : [];

    const updateSlider = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });

        const slides = track.querySelectorAll(".video-card");
        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === currentIndex);
        });

        mediaItems.forEach((item, i) => {
            if (item.tagName === "VIDEO") {
                if (i === currentIndex) {
                    item.muted = true;
                    item.play().catch(err => console.warn("Error al reproducir:", err));
                } else {
                    item.pause();
                    item.currentTime = 0;
                }
            }
        });
    };

    dots.forEach(dot => {
        dot.addEventListener("click", () => {
            const index = parseInt(dot.dataset.index);
            if (!isNaN(index)) {
                currentIndex = index;
                updateSlider();
            }
        });
    });


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
    function setupPlayPauseControls(sliderContainer) {
        const videoCards = sliderContainer.querySelectorAll(".video-card");

        videoCards.forEach(card => {
            const video = card.querySelector("video");
            const button = card.querySelector(".play-pause-btn");

            if (!video || !button) return;

            button.addEventListener("click", () => {
                const playIcon = button.querySelector(".play-icon");
                const pauseIcon = button.querySelector(".pause-icon");

                if (video.paused) {
                    video.play();
                    playIcon.style.display = "none";
                    pauseIcon.style.display = "inline";
                } else {
                    video.pause();
                    playIcon.style.display = "inline";
                    pauseIcon.style.display = "none";
                }
            });



            // Actualizar botón si el video termina (opcional)
            video.addEventListener("ended", () => {
                button.textContent = "▶️";
            });
        });
    }
    function setupMuteToggleControls(sliderContainer) {
        const videoCards = sliderContainer.querySelectorAll(".video-card");

        videoCards.forEach(card => {
            const video = card.querySelector("video");
            const muteBtn = card.querySelector(".mute-toggle-btn");

            if (!video || !muteBtn) return;

            // Establece estado inicial basado en atributo muted
            muteBtn.textContent = video.muted ? "🔇" : "🔊";

            muteBtn.addEventListener("click", () => {
                video.muted = !video.muted;
                muteBtn.textContent = video.muted ? "🔇" : "🔊";
            });
        });
    }

    updateSlider();
    setupPlayPauseControls(sliderContainer);
    setupMuteToggleControls(sliderContainer);
}
