export async function loadPreguntas() {
    try {
        const res = await fetch("data/preguntas.json");
        if (!res.ok) throw new Error("No se pudo cargar el archivo de preguntas frecuentes");

        const data = await res.json();
        const container = document.getElementById("faq-container");

        data.faqs.forEach(faq => {
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            const paragraph = document.createElement("p");

            summary.textContent = faq.question;
            paragraph.textContent = faq.answer;

            details.appendChild(summary);
            details.appendChild(paragraph);
            container.appendChild(details);
        });
    } catch (err) {
        console.error("Error cargando preguntas frecuentes:", err);
    }
}

