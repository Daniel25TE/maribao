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
        const res = await fetch(`https://ur3wos0qn7.execute-api.us-east-1.amazonaws.com/Prod/api/reservations/by-transfer/${encodeURIComponent(numero)}`);
        const data = await res.json();

        if (res.status !== 200) {
            messageDiv.textContent = "Reserva no encontrada";
            return;
        }

        // Mostrar detalles
        detalleText.innerHTML = `
            Nombre: ${data.guestName}<br>
            Cuarto: ${data.roomName}<br>
            Check-in: ${data.checkIn}<br>
            Check-out: ${data.checkOut}<br>
            Estado: ${data.status}
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
        const res = await fetch(`https://ur3wos0qn7.execute-api.us-east-1.amazonaws.com/Prod/api/reservations/by-transfer/${encodeURIComponent(currentNumero)}/cancel`, {
            method: "PATCH"
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
