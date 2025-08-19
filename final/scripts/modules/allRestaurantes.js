export async function allRestaurants() {
    try {
        const res = await fetch("data/restaurants.json");
        const data = await res.json();

        const container = document.getElementById("restaurant-grid");
        data.restaurants.forEach(restaurant => {
            const card = document.createElement("article");
            card.classList.add("restaurant-card");
            card.innerHTML = `
              <h2>${restaurant.name}</h2>
              <a href="${restaurant.direccion}" target="_blank">
                <strong>Dirección:</strong> ${restaurant.direccion1}
              </a>
              <p><strong>Distancia:</strong> ${restaurant.distancia}</p>
              <p><strong>Tipo de comida:</strong> ${restaurant.tipo_comida}</p>
              <a href="${restaurant.telefono}" target="_blank"><strong>Teléfono:</strong> ${restaurant.telefono}</a>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Error cargando restaurantes:", err);
    }
}