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

sliderTrack.addEventListener("pointerdown", (e) => {
  startX = e.clientX || e.touches?.[0]?.clientX;
});

sliderTrack.addEventListener("pointerup", (e) => {
  let endX = e.clientX || e.changedTouches?.[0]?.clientX;
  let difference = startX - endX;

  if (difference > 50 && currentIndex < totalImages - 1) {
    currentIndex++;
  } else if (difference < -50 && currentIndex > 0) {
    currentIndex--;
  }

  changeSlide(currentIndex);
});

document.querySelector(".slider-track").style.touchAction = "pan-y";


















