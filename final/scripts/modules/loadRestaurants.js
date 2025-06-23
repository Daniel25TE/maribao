export async function loadRestaurants() {
    try {
        const res = await fetch("data/restaurants.json");
        const data = await res.json();

        const container = document.getElementById("restaurant-grid");
        container.innerHTML = ""; // Limpiar el contenedor

        // Mezclar aleatoriamente los restaurantes
        const shuffled = data.restaurants.sort(() => 0.5 - Math.random());

        // Tomar los primeros 4
        const selected = shuffled.slice(0, 4);

        selected.forEach(restaurant => {
            const card = document.createElement("article");
            card.classList.add("restaurant-card");
            card.innerHTML = `
              <h2>${restaurant.name}</h2>
              <p><strong>Tipo de comida:</strong> ${restaurant.tipo_comida}</p>
              <p><strong>Distancia:</strong> ${restaurant.distancia}</p>
              <p><strong>Dirección:</strong> ${restaurant.direccion}</p>
              <p><strong>Teléfono:</strong> ${restaurant.telefono}</p>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Error cargando restaurantes:", err);
    }
}
