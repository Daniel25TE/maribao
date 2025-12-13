export function createVideoSlider(sliderContainer) {
    const mediaItems = sliderContainer.querySelectorAll("video");
    const leftBtn = sliderContainer.querySelector(".story-btn.left");
    const rightBtn = sliderContainer.querySelector(".story-btn.right");

    let currentIndex = 0;

    const playCurrent = () => {
        mediaItems.forEach((video, i) => {
            if (i === currentIndex) {
                video.currentTime = 0;
                video.play();
            } else {
                video.pause();
                video.currentTime = 0;
            }
        });
    };

    const nextVideo = () => {
        currentIndex = (currentIndex + 1) % mediaItems.length;
        playCurrent();
    };

    const prevVideo = () => {
        currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
        playCurrent();
    };

    mediaItems.forEach(video => {
        video.addEventListener("ended", nextVideo); // autoplay al terminar
    });

    leftBtn?.addEventListener("click", prevVideo);
    rightBtn?.addEventListener("click", nextVideo);

    // Iniciar primera reproducción
    playCurrent();
}
