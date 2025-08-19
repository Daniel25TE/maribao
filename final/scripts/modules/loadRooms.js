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

            card.innerHTML = `
                <div class="room-images-slider" data-index="0">
                    <button class="slider-btn left">&#10094;</button>
                    <div class="slider-track">
                        ${room.images.map(img => `
                            <img src="${img}" alt="${room.name}" loading="lazy" width="960" height="720">
                        `).join('')}
                    </div>
                    <button class="slider-btn right">&#10095;</button>
                    <div class="slider-indicators"></div>
                </div>
                
                <h3>${room.name}</h3>
                
                <p class="price">$${room.price} por noche</p>
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
                        `<li>${d.replace(/:\s*/g, ':<br>').replace(/\s{2,}/g, '<br>')
                        }</li><hr>`
                    ).join('')
                    }</ul>`
                    : `<p>${(room.fullDetails || 'Información adicional no disponible.')
                        .replace(/:\s*/g, ':<br>')}</p>`
                }
  </div>
</div>


            `;
            const reservarBtn = card.querySelector(".cta-book");

            reservarBtn.addEventListener("click", () => {
                const roomName = card.querySelector("h3").textContent;
                const roomImage = card.querySelector(".slider-track img")?.getAttribute("src") || "";
                const roomPrice = card.querySelector(".price").textContent;

                localStorage.setItem("selectedRoom", JSON.stringify({
                    name: roomName,
                    image: roomImage,
                    price: roomPrice
                }));

                window.location.href = "form.html";
            });

            container.appendChild(card);


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
