export async function cargarComentarios() {
    const contenedor = document.getElementById('comentarios');
    if (!contenedor) return;

    
    contenedor.innerHTML = `
        <div class="comentario placeholder"><strong>González</strong> Buen servicio, todo tranquilo y seguro ⭐️⭐️⭐️⭐️⭐️</div>
        <div class="comentario placeholder"><strong>Mina</strong> Tiene una buena ubicación respecto a la playa y a los restaurantes. El lugar está bastante bien. ⭐️⭐️⭐️⭐️⭐️</div>
        <div class="comentario placeholder"><strong>Jacqueline</strong> Relájate al 100%
            Su ubicación es excelente, mi familia y yo por lo general preferimos disfrutar de una playa tranquila y exclusiva. ⭐️⭐️⭐️⭐️⭐️</div>
        <div class="comentario placeholder"><strong>Marco</strong> Muy tranquilo, cómodo en relación al precio, la atención de su dueño, cerca de la playa ⭐️⭐️⭐️⭐️⭐️</div>
    `;

    try {
        const res = await fetch('https://hotel-backend-3jw7.onrender.com/api/comentarios');
        const comentarios = await res.json();

        if (comentarios.length === 0) {
            contenedor.innerHTML = "<p>No hay comentarios aún.</p>";
            return;
        }

        
        contenedor.innerHTML = comentarios
            .map(c => `<div class="comentario"><strong>${c.nombre}:</strong> ${c.comentario}</div>`)
            .join('');
    } catch (err) {
        contenedor.innerHTML = "<p>Error al cargar comentarios.</p>";
        console.error(err);
    }
}



