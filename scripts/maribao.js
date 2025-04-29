// Función para actualizar la información de la página: año actual y última modificación
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
}

// Función que inyecta el contenido de la home en el elemento con clase "verna"
// Se han agregado atributos loading="lazy" a todas las imágenes
function showHome() {
  const content = document.querySelector(".verna");
  if (content) {
    content.innerHTML = `
      <h1 class="maintitle">Bienvenidos a Maribao!</h1>
      <div class="album">
          <div class="carousel-wrapper">
              <div class="image-container">
                  <img src="images/manta.webp" class="current" alt="Current Image" loading="lazy">
                  <img src="images/quito.webp" class="next" alt="Next Image" loading="lazy">
                  <img src="images/manta.webp" class="prev" alt="Previous Image" loading="lazy">
                  <img src="images/quito.webp" alt="Extra Image" loading="lazy">
                  <img src="images/manta.webp" alt="Extra Image" loading="lazy">
                  <img src="images/quito.webp" alt="Extra Image" loading="lazy">
              </div>
          </div>    
          <button class="prev-btn">◀</button>
          <button class="next-btn">▶</button>
      </div>
      <h1 class="secondtitle">Maribao se ubica en la ciudad de General Villamil entre
       los servicios que ofrece, los mas populares son: </h1>
      
      <ul class="options-list">
          <li class="option-item">
              <img src="images/house.svg" alt="house" loading="lazy" />
              <span>Apartamentos</span>
          </li>
          <li class="option-item">
              <img src="images/parking.svg" alt="parking" loading="lazy" />
              <span>Parking gratis en el alojamiento</span>
          </li>
          <li class="option-item">
              <img src="images/beach.svg" alt="beach" loading="lazy" />
              <span>Vistas al mar</span>
          </li>
          <li class="option-item">
              <img src="images/footprints.svg" alt="footprints" loading="lazy" />
              <span>Admite mascotas</span>
          </li>
          <li class="option-item">
              <img src="images/bathroom.svg" alt="bathroom" loading="lazy" />
              <span>Baño privado</span>
          </li>
          <li class="option-item">
              <img src="images/snow.svg" alt="snow" loading="lazy" />
              <span>Aire acondicionado</span>
          </li>
          <li class="option-item">
              <img src="images/balcony.svg" alt="balcony" loading="lazy" />
              <span>Balcón</span>
          </li>
          <li class="option-item">
              <img src="images/vistas.svg" alt="vista al mar" loading="lazy" />
              <span>Vistas</span>
          </li>
          <li class="option-item">
              <img src="images/family.svg" alt="family" loading="lazy" />
              <span>Habitaciones familiares</span>
          </li>
          <li class="option-item">
              <img src="images/nosmoking.svg" alt="nosmoking" loading="lazy" />
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
          <div class="map-container">
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
      
      <div class="faq-container">
          <div class="faq-item">
              <div class="faq-question">
                  ¿Qué es Lorem Ipsum?
              </div>
              <div class="faq-answer">
                  <p>Lorem Ipsum es simplemente el texto de relleno de la industria de la impresión y composición tipográfica. Se utiliza para simular contenido en diseños.</p>
              </div>
          </div>

          <div class="faq-item">
              <div class="faq-question">
                  ¿Por qué lo usamos?
              </div>
              <div class="faq-answer">
                  <p>Desde el siglo XVI, se utiliza como texto de prueba para evaluar elementos gráficos sin distraer con contenido significativo.</p>
              </div>
          </div>
          <!-- Puedes añadir más elementos FAQ siguiendo la misma estructura -->
      </div>

      <section class="hotel-services">
          <!-- Categoría: Ideal para tu estancia -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/person.svg" alt="Icono Estancia" class="category-icon">
              <h3>Ideal para tu estancia</h3>
            </div>
            <ul class="service-list">
              <li>Recepción 24/7</li>
              <li>Servicio al huésped</li>
              <li>Check-in express</li>
            </ul>
          </div>

          <!-- Categoría: Aparcamiento -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/parking.svg" alt="Icono Aparcamiento" class="category-icon">
              <h3>Aparcamiento</h3>
            </div>
            <ul class="service-list">
              <li>Estacionamiento gratuito</li>
              <li>Valet parking</li>
            </ul>
          </div>

          <!-- Categoría: Internet -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/wifi.svg" alt="Icono Internet" class="category-icon">
              <h3>Internet</h3>
            </div>
            <ul class="service-list">
              <li>Wi-Fi en todo el hotel</li>
              <li>Zona de coworking</li>
            </ul>
          </div>

          <!-- Categoría: Cocina -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/kitchen.svg" alt="Icono Cocina" class="category-icon">
              <h3>Cocina</h3>
            </div>
            <ul class="service-list">
              <li>Restaurante gourmet</li>
              <li>Bar y cafetería</li>
            </ul>
          </div>

          <!-- Categoría: Baño -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/bathroom.svg" alt="Icono Baño" class="category-icon">
              <h3>Baño</h3>
            </div>
            <ul class="service-list">
              <li>Artículos de aseo premium</li>
              <li>Toallas y batas</li>
            </ul>
          </div>

          <!-- Categoría: Zona de estar -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/furniture.svg" alt="Icono Zona de estar" class="category-icon">
              <h3>Zona de estar</h3>
            </div>
            <ul class="service-list">
              <li>Salas confortables</li>
              <li>Área social y lounge</li>
            </ul>
          </div>

          <!-- Categoría: Instalaciones de la habitación -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/bedroom.svg" alt="Icono Instalaciones" class="category-icon">
              <h3>Instalaciones de la habitación</h3>
            </div>
            <ul class="service-list">
              <li>Televisión por cable</li>
              <li>Aire acondicionado</li>
              <li>Minibar</li>
            </ul>
          </div>

          <!-- Categoría: Mascotas -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/footprints.svg" alt="Icono Mascotas" class="category-icon">
              <h3>Mascotas</h3>
            </div>
            <ul class="service-list">
              <li>Recepción de mascotas</li>
              <li>Área para pasear</li>
            </ul>
          </div>

          <!-- Categoría adicional: Spa y Bienestar -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/accesibility.svg" alt="Icono Spa" class="category-icon">
              <h3>Accesibilidad</h3>
            </div>
            <ul class="service-list">
              <li>Masajes relajantes</li>
              <li>Sauna y hammam</li>
            </ul>
          </div>

          <!-- Categoría adicional: Conferencias -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/exteriors.svg" alt="Icono Conferencias" class="category-icon">
              <h3>Exteriores</h3>
            </div>
            <ul class="service-list">
              <li>Salas equipadas</li>
              <li>Asistencia técnica</li>
            </ul>
          </div>

          <!-- Categoría adicional: Actividades al aire libre -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/vistas.svg" alt="Icono Actividades" class="category-icon">
              <h3>Vistas</h3>
            </div>
            <ul class="service-list">
              <li>Piscina y terraza</li>
              <li>Jardín y zonas de picnic</li>
            </ul>
          </div>

          <!-- Categoría adicional: Servicios adicionales -->
          <div class="service-category">
            <div class="category-header">
              <img src="images/recepcionist.svg" alt="Icono Servicios adicionales" class="category-icon">
              <h3>Servicios de Recepcion</h3>
            </div>
            <ul class="service-list">
              <li>Lavandería</li>
              <li>Excursiones y tours</li>
            </ul>
          </div>
        </section>
    `;
  } else {
    console.error("Element with class 'verna' not found.");
  }
}

// Función para inicializar el carrusel
function initCarousel() {
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
      // Quitar clases de estado existentes y resetear estilos inline
      img.classList.remove("prev", "current", "next");
      img.style.opacity = 0;
      img.style.transform = "";

      if (index === prevIndex) {
        img.classList.add("prev");
        img.style.opacity = 0.6;
        img.style.transform = "translate(-60%, -50%) scale(0.8)";
      } else if (index === currentImageIndex) {
        img.classList.add("current");
        img.style.opacity = 1;
        img.style.transform = "translate(-50%, -50%) scale(1)";
      } else if (index === nextIndex) {
        img.classList.add("next");
        img.style.opacity = 0.6;
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

  // Inicializar el carrusel mostrando las imágenes correspondientes
  updateImages();
}

// Maneja la carga del DOM y garantiza que todas las funcionalidades se inicien en orden
document.addEventListener("DOMContentLoaded", function() {
  // Actualizar la información de la página
  updatePageInfo();

  // Funcionalidad para el menú hamburguesa
  const hamburger = document.querySelector(".hamburger");
  const navigation = document.querySelector(".navigation");
  if (hamburger && navigation) {
    hamburger.addEventListener("click", function() {
      navigation.classList.toggle("active");
      hamburger.classList.toggle("is-active");
    });
  }

  // Inyectar el contenido de la home
  showHome();

  // Inicializar el carrusel de forma inmediata o mediante MutationObserver si aún no hay imágenes
  const imageContainer = document.querySelector(".image-container");
  if (imageContainer) {
    const images = imageContainer.querySelectorAll("img");
    if (images.length > 0) {
      initCarousel();
    } else {
      // En caso de que las imágenes se añadan de forma asíncrona, se usa un MutationObserver
      const observer = new MutationObserver((mutations, obs) => {
        const imgs = imageContainer.querySelectorAll("img");
        if (imgs.length > 0) {
          initCarousel();
          obs.disconnect();
        }
      });
      observer.observe(imageContainer, { childList: true });
    }
  }

  // Configuración del comportamiento de la sección FAQ, comprobando la existencia de cada pregunta
  const faqItems = document.querySelectorAll('.faq-container .faq-item');
  faqItems.forEach(function(item) {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function() {
        item.classList.toggle('active');
      });
    }
  });
});




