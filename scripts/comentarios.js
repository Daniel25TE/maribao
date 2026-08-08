// comentarios.js
document.getElementById('enviarComentario').addEventListener('click', async () => {
    const numReserva = document.getElementById('numReserva').value.trim();
    const comentario = document.getElementById('comentario').value.trim();
    const mensaje = document.getElementById('mensaje');

    // Validación simple
    if (!numReserva || !comentario) {
        mensaje.textContent = "Por favor completa ambos campos.";
        mensaje.style.color = "red";
        return;
    }

    try {
        // Enviar comentario al backend
        const res = await fetch(`https://ur3wos0qn7.execute-api.us-east-1.amazonaws.com/Prod/api/reservations/by-transfer/${encodeURIComponent(numReserva)}/comment`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: comentario })
        });

        const data = await res.json();

        if (res.ok && data.id) {
            // Ocultar los fields
            document.getElementById('numReserva').style.display = 'none';
            document.getElementById('comentario').style.display = 'none';
            document.getElementById('enviarComentario').style.display = 'none';

            // Mostrar mensaje final
            mensaje.textContent = "Gracias por tu comentario. Ahora puedes cerrar esta página.";
            mensaje.style.color = "green";
        }
        else {
            mensaje.textContent = res.status === 404 ? "Número de reserva no encontrado." : "No se pudo guardar el comentario.";
            mensaje.style.color = "red";
        }
    } catch (err) {
        mensaje.textContent = "Error al enviar el comentario.";
        mensaje.style.color = "red";
        console.error(err);
    }
});

