// scripts/cancelarFrontend.js
const buscarForm = document.getElementById("buscar-form");
const detalleDiv = document.getElementById("reserva-detalles");
const detalleText = document.getElementById("detalle-text");
const cancelarBtn = document.getElementById("cancelar-btn");
const messageDiv = document.getElementById("cancel-message");

let currentNumero = null;

// Buscar reserva
buscarForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.textContent = "Buscando reserva...";
    detalleDiv.style.display = "none";

    const numero = document.getElementById("reservation-number").value.trim();
    if (!numero) return;

    try {
        const res = await fetch(`https://hotel-backend-3jw7.onrender.com/cancelar/cliente/${numero}`);
        const data = await res.json();

        if (res.status !== 200) {
            messageDiv.textContent = data.error || "Reserva no encontrada";
            return;
        }

        // Mostrar detalles
        detalleText.innerHTML = `
            Nombre: ${data.nombre}<br>
            Cuarto: ${data.room_name}<br>
            Check-in: ${data.checkin_date}<br>
            Check-out: ${data.checkout_date}<br>
            Método de pago: ${data.metodo_pago}
        `;
        currentNumero = numero;
        detalleDiv.style.display = "block";
        messageDiv.textContent = "";
    } catch (err) {
        console.error(err);
        messageDiv.textContent = "Error buscando la reserva";
    }
});

// Cancelar reserva
cancelarBtn.addEventListener("click", async () => {
    if (!currentNumero) return;

    const confirmCancel = confirm("¿Estás seguro de cancelar la reserva?");
    if (!confirmCancel) return;

    try {
        const res = await fetch(`https://hotel-backend-3jw7.onrender.com/cancelar/cliente/${currentNumero}`, {
            method: "PUT"
        });

        const data = await res.json();

        if (res.status !== 200) {
            messageDiv.textContent = data.error || "Error al cancelar la reserva";
            return;
        }

        detalleDiv.style.display = "none";
        buscarForm.style.display = "none";
        messageDiv.textContent = "✅ Reserva cancelada correctamente, puedes cerrar esta pagina.";
    } catch (err) {
        console.error(err);
        messageDiv.textContent = "Error al cancelar la reserva";
    }
});
