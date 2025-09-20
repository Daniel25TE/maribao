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

            card.innerHTML = `
                <div class="room-images-slider" data-index="0">
                    <button class="slider-btn left">&#10094;</button>
                    <div class="slider-track">
                        ${room.images.map(img => `
                            <img src="${img.src}" srcset="${img.srcset}" sizes="${img.sizes}" 
                                 alt="${img.alt || room.name}" loading="lazy" 
                                 width="${img.width}" height="${img.height}" 
                                 title="${img.title || ''}">
                        `).join('')}
                    </div>
                    <button class="slider-btn right">&#10095;</button>
                    <div class="slider-indicators"></div>
                </div>

                <h3>${room.name}</h3>

                ${hasRates ? `
                    <label class="rate-label">
                        Cantidad de personas:
                        <select class="rate-select">
                            <option value="" disabled selected>Selecciona la cantidad de personas</option>
                            ${room.rates.map(r => `
                                <option value="${r.price}" data-people="${r.people}">
                                    ${r.people} ${r.people === 1 ? 'persona' : 'personas'} - $${r.price} x noche
                                </option>
                            `).join('')}
                        </select>
                    </label>
                ` : ''}

                <div class="age-selection-container"></div>

                <p class="price">$0 por noche</p>

                <p><strong>Camas:</strong> ${room.beds}</p>
                <p>${room.description}</p>
                <ul class="features">
                    ${room.features.map(f => `<li>${f}</li>`).join('')}
                </ul>

                <button class="open-modal-btn" data-modal="${modalId}">Ver todo lo que incluye este cuarto</button>
                <button class="cta-book">Reservar</button>

                <!-- Modal funcionando -->
                <div class="modal" id="${modalId}">
                    <div class="modal-content">
                        <span class="close-modal-btn" data-modal="${modalId}">&times;</span>
                        <h4>${room.name} - Detalles</h4>
                        ${Array.isArray(room.fullDetails)
                            ? `<ul>${room.fullDetails.map(d => `<li>${d.replace(/:\s*/g, ':<br>').replace(/\s{2,}/g, '<br>')}</li><hr>`).join('')}</ul>`
                            : `<p>${room.fullDetails || 'Información adicional no disponible.'}</p>`
                        }
                    </div>
                </div>
            `;

            container.appendChild(card);

            const sliderContainer = card.querySelector(".room-images-slider");
            createSlider(sliderContainer);

            const select = card.querySelector('.rate-select');
            const priceEl = card.querySelector('.price');
            const ageContainer = card.querySelector('.age-selection-container');

            let selectedPrice = 0;
            let totalPeople = 0;

            const generateAgeCheckboxes = (num) => {
                ageContainer.innerHTML = '';
                const columns = ['Niños', 'Adultos', 'Ancianos'];
                const colDiv = document.createElement('div');
                colDiv.className = 'age-columns';
                columns.forEach(col => {
                    const colContainer = document.createElement('div');
                    colContainer.className = 'age-column';
                    const title = document.createElement('p');
                    title.textContent = col;
                    colContainer.appendChild(title);
                    for (let i = 0; i < num; i++) {
                        const cb = document.createElement('input');
                        cb.type = 'checkbox';
                        cb.name = col.toLowerCase();
                        cb.value = 1;
                        cb.id = `${col.toLowerCase()}-${i}-${index}`;

                        const lbl = document.createElement('label');
                        lbl.setAttribute('for', cb.id);
                        lbl.textContent = '';

                        colContainer.appendChild(cb);
                        colContainer.appendChild(lbl);
                    }

                    colDiv.appendChild(colContainer);
                });
                ageContainer.appendChild(colDiv);
            };

          
            const calculatePrice = () => {
                const childCB = Array.from(ageContainer.querySelectorAll('input[name="niños"]:checked')).length;
                const elderCB = Array.from(ageContainer.querySelectorAll('input[name="ancianos"]:checked')).length;
                const adultCB = Array.from(ageContainer.querySelectorAll('input[name="adultos"]:checked')).length;

                if (adultCB + childCB + elderCB === 0) {
                    priceEl.textContent = `$0 por noche`;
                    selectedPrice = 0;
                    return;
                }

                const people = adultCB + childCB + elderCB;
                const rate = room.rates.find(r => r.people === people) || room.rates[room.rates.length - 1];
                let totalPrice = rate.price;

            
                const adultRate = room.rates.find(r => r.people === adultCB) || { price: 0 };
                const childElderDiscount = 0.5 * ((childCB + elderCB) * (rate.price - adultRate.price)/Math.max(people-adultCB,1));

                totalPrice -= childElderDiscount;

                priceEl.textContent = `$${totalPrice.toFixed(2)} por noche`;
                selectedPrice = totalPrice;
            };

        
            if (select) {
                select.addEventListener('change', () => {
                    totalPeople = parseInt(select.selectedOptions[0].dataset.people, 10);
                    generateAgeCheckboxes(totalPeople);
                    priceEl.textContent = `$0 por noche`;
                    selectedPrice = 0;

                  
                    ageContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                        cb.addEventListener('change', () => {
                            calculatePrice();

                          
                            const totalSelected = Array.from(ageContainer.querySelectorAll('input[type="checkbox"]:checked')).length;
                            ageContainer.querySelectorAll('input[type="checkbox"]').forEach(box => {
                                if (!box.checked) {
                                    box.disabled = totalSelected >= totalPeople;
                                }
                            });
                        });
                    });
                });
            }

            const reservarBtn = card.querySelector(".cta-book");
            reservarBtn.addEventListener("click", () => {
                const roomName = card.querySelector("h3").textContent;
                const roomImage = card.querySelector(".slider-track img")?.getAttribute("src") || "";

                localStorage.setItem("selectedRoom", JSON.stringify({
                    name: roomName,
                    image: roomImage,
                    price: `$${selectedPrice.toFixed(2)} por noche`,
                    priceNumber: selectedPrice
                }));

                window.location.href = "form.html";
            });
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

