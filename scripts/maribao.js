window.onload = function() {
  updatePageInfo();
};
// Update current year and last modified info
function updatePageInfo() {
  const currentYear = new Date().getFullYear();

  const currentYearElem = document.getElementById("currentyear");
  if (currentYearElem) {
    currentYearElem.textContent = currentYear;
  }

  const currentYearMobileElem = document.getElementById("currentyear-mobile");
  if (currentYearMobileElem) {
    currentYearMobileElem.textContent = currentYear;
  }

  const lastModifiedElem = document.getElementById("lastModified");
  if (lastModifiedElem) {
    lastModifiedElem.textContent = `Last Modified: ${document.lastModified}`;
  }
};

document.addEventListener("DOMContentLoaded", function () {
  // Hamburger Menu Functionality
  const hamburger = document.querySelector(".hamburger");
  const navigation = document.querySelector(".navigation");
  if (hamburger && navigation) {
    hamburger.addEventListener("click", function () {
      navigation.classList.toggle("active");
      hamburger.classList.toggle("is-active");
    });
  }

  // Inject home content (carousel and more) into the page
  showHome();

  // Ensure images have native lazy loading enabled
 

  // Carousel logic
  const initCarousel = () => {
    const images = document.querySelectorAll(".image-container img");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    if (!images.length) {
      console.warn("No images found in the carousel.");
      return;
    }

    let currentImageIndex = 0;

    function updateImages() {
      const len = images.length;
      const prevIndex = (currentImageIndex - 1 + len) % len;
      const nextIndex = (currentImageIndex + 1) % len;

      images.forEach((img, index) => {
        // Remove existing state classes and reset inline styles
        img.classList.remove("prev", "current", "next");
        img.style.opacity = 0;
        img.style.transform = "";

        if (index === prevIndex) {
          img.classList.add("prev");
          img.style.opacity = 0.6;
          // Adjusted transform values to keep it closer to the main image
          img.style.transform = "translate(-60%, -50%) scale(0.8)";
        } else if (index === currentImageIndex) {
          img.classList.add("current");
          img.style.opacity = 1;
          img.style.transform = "translate(-50%, -50%) scale(1)";
        } else if (index === nextIndex) {
          img.classList.add("next");
          img.style.opacity = 0.6;
          // Adjusted transform values to keep it closer to the main image
          img.style.transform = "translate(-40%, -50%) scale(0.8)";
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateImages();
      });
    } else {
      console.warn("Previous button not found.");
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateImages();
      });
    } else {
      console.warn("Next button not found.");
    }

    // Initialize the carousel display
    updateImages();
  };

  // Check if carousel images are already in the DOM; if not, wait briefly
  const carouselImagesAvailable = document.querySelectorAll(".image-container img").length > 0;
  if (carouselImagesAvailable) {
    initCarousel();
  } else {
    setTimeout(initCarousel, 100);
  }
});

/**
 * Ensures that all images in the carousel have the native lazy loading attribute.
 */


/**
 * Inserts the home content into the element with class "verna".
 * The carousel images now include `loading="lazy"` to enable native lazy loading.
 */
function showHome() {
  const content = document.querySelector(".verna");
  if (content) {
    content.innerHTML = `
      <h1 class="maintitle">Bienvenidos a Maribao!</h1>
      <div class="album">
          <div class="carousel-wrapper">
              <div class="image-container">
                  <img src="images/manta.webp" class="current" alt="Current Image" >
                  <img src="images/quito.webp" class="next" alt="Next Image" >
                  <img src="images/manta.webp" class="prev" alt="Previous Image" >
                  <img src="images/quito.webp" alt="Extra Image" >
                  <img src="images/manta.webp" alt="Extra Image" >
                  <img src="images/quito.webp" alt="Extra Image" >
              </div>
          </div>    
          <button class="prev-btn">◀</button>
          <button class="next-btn">▶</button>
      </div>
      <h1 class="secondtitle">Maribao se ubica en la ciudad de General Villamil entre
       los servicios que ofrece, los mas populares son: </h1>
      
        <ul class="options-list">
            <li class="option-item">
              <img src="images/house.svg" alt="house" />
              <span>Apartamentos</span>
            </li>
            <li class="option-item">
              <img src="images/parking.svg" alt="parking" />
              <span>Parking gratis en el alojamiento</span>
            </li>
            <li class="option-item">
              <img src="images/beach.svg" alt="beach" />
              <span>Vistas al mar</span>
            </li>
            <li class="option-item">
              <img src="images/footprints.svg" alt="footprints" />
              <span>Admite mascotas</span>
            </li>
            <li class="option-item">
              <img src="images/bathroom.svg" alt="bathroom" />
              <span>Baño privado</span>
            </li>
            <li class="option-item">
              <img src="images/snow.svg" alt="snow" />
              <span>Aire acondicionado</span>
            </li>
            <li class="option-item">
              <img src="images/balcony.svg" alt="balcony" />
              <span>Balcón</span>
            </li>
            <li class="option-item">
              <img src="images/vistas.svg" alt="vista al mar" />
              <span>Vistas</span>
            </li>
            <li class="option-item">
              <img src="images/family.svg" alt="family" />
              <span>Habitaciones familiares</span>
            </li>
            <li class="option-item">
              <img src="images/nosmoking.svg" alt="nosmoking" />
              <span>Habitaciones sin humo</span>
            </li>
        </ul>
        <div class="container">
          <!-- Contenedor de la información textual -->
          <div class="info">
            <h1 class="interactivemap">Ubicación excelente</h1>
            <p class="interactivetextmap">Maribao Playa Paraiso, Engabao, General Villamil, Ecuador</p>
            <a href="tel:+1234567890" class="call-us-map-interactive">
              Tel: +123-456-7890
            </a>
            <p class="interactivetextmap">Está ubicado en una de las mejores playas de General Villamil</p>
            <p class="interactivetextmap">106 km del aeropuerto</p>
            <p class="interactivetextmap">10 min de la playa</p>
            <p class="interactivetextmap">Restaurantes y cafeterías alrededor de 12 km</p>
          </div>
          <!-- Contenedor del mapa -->
          <div class="map-container" >
            <iframe title="Interactive Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3985.7793214073413!2d-80.49264022525449!3d-2.57830673840276!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x90320dd0f236bb69%3A0x46376d112e4e3e9f!2sMARIBAO!5e0!3m2!1ses-419!2sus!4v1745846208372!5m2!1ses-419!2sus" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                          
          </div>
        </div>

        <h1 class="secondtitle">Restaurantes cercanos</h1>
        <div class="restaurants">
          <div class="restaurant-container">
            <div class="restaurant-card">
              <h2>Restaurante La Plaza</h2>
              <p>Tipo de comida: Mexicana</p>
              <p>Distancia: 0.5 millas</p>
              <p>Dirección: 123 Main St, West Jordan</p>
              <p>Teléfono: (801) 123-4567</p>
            </div>
            <div class="restaurant-card">
              <h2>Café Sol</h2>
              <p>Tipo de comida: Italiana</p>
              <p>Distancia: 0.8 millas</p>
              <p>Dirección: 456 Elm St, West Jordan</p>
              <p>Teléfono: (801) 987-6543</p>
            </div>
            <div class="restaurant-card">
              <h2>Delicias del Mar</h2>
              <p>Tipo de comida: Mariscos</p>
              <p>Distancia: 1.2 millas</p>
              <p>Dirección: 789 Oak St, West Jordan</p>
              <p>Teléfono: (801) 555-6789</p>
            </div>
            <div class="restaurant-card">
              <h2>Café Aroma</h2>
              <p>Tipo de comida: Cafetería</p>
              <p>Distancia: 0.3 millas</p>
              <p>Dirección: 321 Pine St, West Jordan</p>
              <p>Teléfono: (801) 999-1111</p>
            </div>
          </div>
        </div>


    `;
  } else {
    console.error("Element with class 'verna' not found.");
  }
}



