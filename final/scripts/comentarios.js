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
        const res = await fetch('https://hotel-backend-3jw7.onrender.com/api/comentario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numReserva, comentario })
        });

        const data = await res.json();

        if (data.ok) {
            // Ocultar los fields
            document.getElementById('numReserva').style.display = 'none';
            document.getElementById('comentario').style.display = 'none';
            document.getElementById('enviarComentario').style.display = 'none';

            // Mostrar mensaje final
            mensaje.textContent = "Gracias por tu comentario. Ahora puedes cerrar esta página.";
            mensaje.style.color = "green";
        }
        else {
            mensaje.textContent = data.error;
            mensaje.style.color = "red";
        }
    } catch (err) {
        mensaje.textContent = "Error al enviar el comentario.";
        mensaje.style.color = "red";
        console.error(err);
    }
});

