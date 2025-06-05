export async function loadOptions() {
    try {
        const res = await fetch("data/services.json");
        if (!res.ok) throw new Error("Error cargando opciones");

        const options = await res.json();

        // Mezcla aleatoria de elementos
        const shuffled = options.sort(() => 0.5 - Math.random());

        // Tomar los primeros 11
        const selected = shuffled.slice(0, 11);

        const list = document.querySelector(".options-list");
        list.innerHTML = selected.map(item => `
            <li class="option-item">
              <img src="${item.icon}" alt="${item.alt}">
              <span>${item.label}</span>
            </li>
        `).join("");
    } catch (err) {
        console.error(err);
    }
}
