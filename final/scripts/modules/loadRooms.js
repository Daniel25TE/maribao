import { createSlider } from './slider.js';

export async function loadRooms() {
    try {
        const response = await fetch('data/rooms.json');
        if (!response.ok) throw new Error('No se pudo cargar el archivo JSON');

        const data = await response.json();
        const container = document.getElementById('rooms-container');

        data.rooms.forEach((room, index) => {
            const card = document.createElement('div');
            card.className = 'room-card';

            const modalId = `modal-${index}`;

            const hasRates = Array.isArray(room.rates) && room.rates.length > 0;
            const defaultRate = hasRates ? room.rates[0] : null;
            const initialPrice = hasRates ? defaultRate.price : room.price;

            card.innerHTML = `
              <div class="room-images-slider" data-index="0">
                <button class="slider-btn left">&#10094;</button>
                <div class="slider-track">
                  ${room.images.map(img => `
                    <img 
                      src="${img.src}" 
                      srcset="${img.srcset}" 
                      sizes="${img.sizes}" 
                      alt="${img.alt || room.name}" 
                      loading="lazy" 
                      width="${img.width}" 
                      height="${img.height}" 
                      title="${img.title || ''}"
                    >
                  `).join('')}
                </div>
                <button class="slider-btn right">&#10095;</button>
                <div class="slider-indicators"></div>
              </div>
                
              <h3>${room.name}</h3>
                
              ${hasRates
                    ? `
                    <label class="rate-label">
                      Cantidad de personas:
                      <select class="rate-select">
                        ${room.rates.map(r => `
                          <option value="${r.price}" data-people="${r.people}">
                            ${r.people} ${r.people === 1 ? 'persona' : 'personas'} - $${r.price} x noche
                          </option>
                        `).join('')}
                      </select>
                    </label>
                  `
                    : ''
                }
                        
              <p class="price">$${initialPrice} por noche</p>
                        
              <p><strong>Camas:</strong> ${room.beds}</p>
              <p>${room.description}</p>
              <ul class="features">
                ${room.features.map(f => `<li>${f}</li>`).join('')}
              </ul>
                        
              <button class="open-modal-btn" data-modal="${modalId}">Ver todo lo que incluye este cuarto</button>
              <button class="cta-book">Reservar</button>
                        
              <div class="modal" id="${modalId}">
                <div class="modal-content">
                  <span class="close-modal-btn" data-modal="${modalId}">&times;</span>
                  <h4>${room.name} - Detalles</h4>
                  ${Array.isArray(room.fullDetails)
                    ? `<ul>${room.fullDetails.map(d =>
                        `<li>${d.replace(/:\s*/g, ':<br>').replace(/\s{2,}/g, '<br>')}</li><hr>`
                    ).join('')}</ul>`
                    : `<p>${(room.fullDetails || 'Información adicional no disponible.').replace(/:\s*/g, ':<br>')}</p>`
                }
                </div>
              </div>
            `;

            const reservarBtn = card.querySelector(".cta-book");

            reservarBtn.addEventListener("click", () => {
                const roomName = card.querySelector("h3").textContent;
                const roomImage = card.querySelector(".slider-track img")?.getAttribute("src") || "";
                const select = card.querySelector(".rate-select");

                let priceNumber;
                let people = null;

                if (select) {
                    priceNumber = parseFloat(select.value);
                    const opt = select.selectedOptions[0];
                    people = parseInt(opt.dataset.people, 10);
                } else {
                    priceNumber = parseFloat(room.price);
                }

                // Mantén el formato que tu formulario ya consume:
                const priceText = `$${priceNumber} por noche`;

                localStorage.setItem("selectedRoom", JSON.stringify({
                    name: roomName,
                    image: roomImage,
                    price: priceText,    // lo que tu form ya usa para calcular total
                    priceNumber,         // por si lo quieres usar luego
                    people               // opcional, por si lo quieres mostrar en el form
                }));

                window.location.href = "form.html";
            });


            container.appendChild(card);
            // Si el cuarto tiene tarifas por cantidad de personas, sincroniza el precio mostrado
            if (hasRates) {
                const select = card.querySelector('.rate-select');
                const priceEl = card.querySelector('.price');

                const syncPriceText = () => {
                    const price = parseFloat(select.value);
                    priceEl.textContent = `$${price} por noche`;
                };

                // Precio inicial
                syncPriceText();

                // Precio al cambiar selección
                select.addEventListener('change', syncPriceText);
            }



            const sliderContainer = card.querySelector(".room-images-slider");
            createSlider(sliderContainer);
        });

        setupModalListeners();

    } catch (error) {
        console.error('Error al cargar las habitaciones:', error);
    }
}



function setupModalListeners() {
    document.querySelectorAll('.open-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = document.getElementById(btn.dataset.modal);
            if (modal) modal.classList.add('visible');
        });
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = document.getElementById(btn.dataset.modal);
            if (modal) modal.classList.remove('visible');
        });
    });


    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('visible');
        });
    });
}
