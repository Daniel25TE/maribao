export async function cargarComentarios() {
    const contenedor = document.getElementById('comentarios');
    if (!contenedor) return;

    try {
        const res = await fetch('/api/comentarios');
        const comentarios = await res.json();

        if (comentarios.length === 0) {
            contenedor.innerHTML = "<p>No hay comentarios aún.</p>";
            return;
        }

        contenedor.innerHTML = comentarios
            .map(c => `<div class="comentario"><strong>Reserva ${c.numero}:</strong> ${c.comentario}</div>`)
            .join('');
    } catch (err) {
        contenedor.innerHTML = "<p>Error al cargar comentarios.</p>";
        console.error(err);
    }
}


