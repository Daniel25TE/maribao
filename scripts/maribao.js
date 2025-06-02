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

// Generate dots for indicators
dotsContainer.innerHTML = Array.from({ length: totalImages }, (_, i) =>
  `<span class="dot ${i === 0 ? 'active' : ''}" onclick="changeSlide(${i})"></span>`
).join('');

const dots = document.querySelectorAll(".dot");

// Function to change slide
function changeSlide(index) {
  currentIndex = index;
  sliderTrack.style.transform = `translateX(-${index * 100}%)`;
  updateDots();
}

// Function to update active dot indicator
function updateDots() {
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}

let startX = 0;

// Touch start event
sliderTrack.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
}, { passive: true });

// Touch end event
sliderTrack.addEventListener("touchend", (e) => {
  let endX = e.changedTouches[0].clientX;
  let difference = startX - endX;

  if (difference > 50 && currentIndex < totalImages - 1) {
    currentIndex++;
  } else if (difference < -50 && currentIndex > 0) {
    currentIndex--;
  }

  changeSlide(currentIndex);
}, { passive: true });













