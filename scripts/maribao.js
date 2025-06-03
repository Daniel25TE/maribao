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

let startX = 0;
let moveX = 0;

// Evento `touchstart` para iniciar gesto táctil
sliderTrack.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

// Evento `touchmove` para captar desplazamiento
sliderTrack.addEventListener("touchmove", (e) => {
  moveX = e.touches[0].clientX;
});

// Evento `touchend` para finalizar gesto y determinar desplazamiento
sliderTrack.addEventListener("touchend", (e) => {
  let difference = startX - moveX;

  if (difference > 50 && currentIndex < totalImages - 1) {
    currentIndex++;
  } else if (difference < -50 && currentIndex > 0) {
    currentIndex--;
  }

  changeSlide(currentIndex);
});

// Asegurar interactividad táctil correcta
sliderTrack.style.touchAction = "pan-y";

















