import { supabase } from './database.js';

const buscarForm = document.getElementById("buscar-form");
const detalleDiv = document.getElementById("reserva-detalles");
const detalleText = document.getElementById("detalle-text");
const cancelarBtn = document.getElementById("cancelar-btn");
const messageDiv = document.getElementById("cancel-message");

let currentReservationNumber = null;

// Paso 1: Buscar reserva
buscarForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.innerHTML = `<p style="color:blue;">Buscando reserva...</p>`;
    detalleDiv.style.display = "none";

    const reservationNumber = document.getElementById("reservation-number").value.trim();
    if (!reservationNumber) return;

    try {
        const { data, error } = await supabase
            .from("reservas")
            .select("*")
            .eq("numero_Transferencia", reservationNumber)
            .single();

        if (error || !data) {
            messageDiv.innerHTML = `<p style="color:red;">❌ Reserva no encontrada.</p>`;
            return;
        }

        // Mostrar detalles
        detalleText.innerHTML = `
            Habitación: ${data.room_name} <br>
            Check-in: ${data.checkin_date} <br>
            Check-out: ${data.checkout_date} <br>
            Total: $${data.total} <br>
            Método de pago: ${data.metodo_pago}
        `;
        currentReservationNumber = reservationNumber;
        detalleDiv.style.display = "block";
        messageDiv.innerHTML = "";
    } catch (err) {
        console.error(err);
        messageDiv.innerHTML = `<p style="color:red;">❌ Error al buscar la reserva.</p>`;
    }
});

// Paso 2: Cancelar reserva
cancelarBtn.addEventListener("click", async () => {
    if (!currentReservationNumber) return;

    const confirmCancel = confirm("¿Estás seguro de que deseas cancelar tu reserva?");
    if (!confirmCancel) return;

    try {
        const { data, error } = await supabase
            .from("reservas")
            .delete()
            .eq("numero_Transferencia", currentReservationNumber);

        if (error) {
            messageDiv.innerHTML = `<p style="color:red;">❌ Error al cancelar la reserva.</p>`;
            return;
        }

        detalleDiv.style.display = "none";
        buscarForm.style.display = "none"; // opcional, para ocultar input
        messageDiv.innerHTML = `<p style="color:green;">✅ Tu reserva ha sido cancelada correctamente.</p>`;
    } catch (err) {
        console.error(err);
        messageDiv.innerHTML = `<p style="color:red;">❌ Error al cancelar la reserva.</p>`;
    }
});

