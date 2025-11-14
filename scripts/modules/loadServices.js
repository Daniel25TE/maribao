export async function loadOptions() {
    try {
        const res = await fetch("data/services.json");
        if (!res.ok) throw new Error("Error cargando opciones");

        const options = await res.json();
        const list = document.querySelector(".options-list");

        list.innerHTML = options.map((item, index) => {
            const modalId = `modal-${index}`;
            const detailsHtml = Array.isArray(item.fullDetails)
                ? `<ul>${item.fullDetails.map(detail => `<li>${detail}</li>`).join("")}</ul>`
                : `<p>${item.fullDetails || 'Información adicional no disponible.'}</p>`;
            return `
                <li class="option-item">
                    <p>${item.rating}</p>
                    <img src="${item.icon}" alt="${item.alt}">
                    <span>${item.label}</span>
                    <button class="open-modal-btn" data-modal="${modalId}">
                        Ver detalles
                    </button>
                </li>
                <div class="modal" id="${modalId}">
                    <div class="modal-content">
                        <span class="close-modal-btn" data-modal="${modalId}">&times;</span>
                        <h4>Detalles</h4>
                        ${detailsHtml}
                    </div>
                </div>
            `;
        }).join("");

        setupModalListeners();
    } catch (err) {
        console.error(err);
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