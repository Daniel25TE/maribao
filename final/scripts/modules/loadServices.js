export async function loadOptions() {
    try {
        const res = await fetch("data/services.json");
        if (!res.ok) throw new Error("Error cargando opciones");

        const options = await res.json();
        const list = document.querySelector(".options-list");
        list.innerHTML = options.map(item => `
            <li class="option-item">
            <p>${item.rating}</p>
              <img src="${item.icon}" alt="${item.alt}">
              <span>${item.label}</span>
            </li>
        `).join("");
    } catch (err) {
        console.error(err);
    }
}