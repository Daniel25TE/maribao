document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger-menu");
  const nav = document.querySelector("nav");

  hamburger.addEventListener("click", function () {
    nav.classList.toggle("active");
    hamburger.classList.toggle("active");

    hamburger.textContent = hamburger.classList.contains("active") ? "✖" : "☰";
  });

  document.addEventListener("click", function (event) {
    if (!hamburger.contains(event.target) && !nav.contains(event.target)) {
      nav.classList.remove("active");
      hamburger.classList.remove("active");
      hamburger.textContent = "☰";
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const imageContainer = document.querySelector(".image-container");
  const images = document.querySelectorAll(".image-container img");
  const dots = document.querySelectorAll(".dot");
  let currentIndex = 0;

  const updateCarousel = () => {
    imageContainer.style.transform = `translateX(${-currentIndex * images[0].clientWidth}px)`;
    dots.forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
  };

  dots.forEach((dot, i) => dot.addEventListener("click", () => { currentIndex = i; updateCarousel(); }));

  imageContainer.addEventListener("touchstart", (e) => startX = e.touches[0].clientX);
  imageContainer.addEventListener("touchend", (e) => {
    let endX = e.changedTouches[0].clientX;
    currentIndex = Math.min(Math.max(currentIndex + (startX > endX + 50) - (startX < endX - 50), 0), images.length - 1);
    updateCarousel();
  });

  window.addEventListener("resize", updateCarousel);
});







