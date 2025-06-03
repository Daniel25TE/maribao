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
const sliderTrack = document.querySelector(".slider-track");
const dotsContainer = document.querySelector(".slider-indicators");
let currentIndex = 0;
const totalImages = sliderTrack.children.length;

dotsContainer.innerHTML = Array.from({ length: totalImages }, (_, i) =>
  `<span class="dot ${i === 0 ? 'active' : ''}" onclick="changeSlide(${i})"></span>`
).join('');

const dots = document.querySelectorAll(".dot");

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


















