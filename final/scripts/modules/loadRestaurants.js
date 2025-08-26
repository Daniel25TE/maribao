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
              <a href="${restaurant.direccion}" target="_blank">
                <strong>Dirección:</strong> ${restaurant.direccion1}
              </a>
              <p><strong>Distancia:</strong> ${restaurant.distancia}</p>
              <p><strong>Tipo de comida:</strong> ${restaurant.tipo_comida}</p>
              <a href="${restaurant.telefono}" target="_blank"><strong>Teléfono:</strong> ${restaurant.telefono}</a>
              
            `;
            container.appendChild(card);
        });
        container.innerHTML += `
    <article class="option-item ver-mas">
        <a href="servicios.html" aria-label="Ir a todos los servicios">
        
        Ver todos los restaurantes
            
        </a>
        <a href="servicios.html" aria-label="Ir a todos los servicios">
        <img src="images/arrow-right-square-fill.svg" alt="Todos los servicios.">
        </a>
    </article>
`;

    } catch (err) {
        console.error("Error cargando restaurantes:", err);
    }
}
