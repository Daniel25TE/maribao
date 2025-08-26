export async function loadQuestions() {
    try {
        const res = await fetch("data/preguntas.json");
        if (!res.ok) throw new Error("No se pudo cargar el archivo de preguntas frecuentes");

        const data = await res.json();
        const container = document.getElementById("faq-container-some");
        container.innerHTML = "";

        // Mezclar aleatoriamente los restaurantes
        const shuffled = data.faqs.sort(() => 0.5 - Math.random());

        // Tomar los primeros 4
        const selected = shuffled.slice(0, 4);

        selected.forEach(faq => {
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            const paragraph = document.createElement("p");

            summary.textContent = faq.question;
            paragraph.textContent = faq.answer;

            details.appendChild(summary);
            details.appendChild(paragraph);
            container.appendChild(details);
        });
        container.innerHTML += `
    <article class="option-item ver-mas">
        <a href="servicios.html" aria-label="Ir a todos los servicios">
        Ver todas las preguntas frequentes
            
        </a>
        <a href="servicios.html" aria-label="Ir a todos los servicios">
        <img src="images/arrow-right-square-fill.svg" alt="Todos los servicios.">
        </a>
    </article>
`;
    } catch (err) {
        console.error("Error cargando preguntas frecuentes:", err);
    }
}
