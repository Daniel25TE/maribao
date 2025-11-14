export async function loadOptions() {
    try {
        const res = await fetch("data/services.json");
        if (!res.ok) throw new Error("Error cargando opciones");

        const options = await res.json();

        // Mezcla aleatoria de elementos
        const shuffled = options.sort(() => 0.5 - Math.random());

        // Tomar los primeros 11
        const selected = shuffled.slice(0, 10);

        const list = document.querySelector(".options-list");
        list.innerHTML = selected.map(item => `
            <li class="option-item">
            <p>${item.rating}</p>
              <img src="${item.icon}" alt="${item.alt}">
              <span>${item.label}</span>
            </li>
        `).join("");
        list.innerHTML += `
            <li class="option-item ver-mas">
                <a href="servicios.html" aria-label="Ir a todos los servicios">
                <img src="images/arrow-right-square-fill.svg" alt="Todos los servicios.">
                </a>
                <span>Ver todos los servicios</span>
            </li>
        `;
    } catch (err) {
        console.error(err);
    }
}
