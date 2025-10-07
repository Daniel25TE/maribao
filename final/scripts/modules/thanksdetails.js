export function thanksdetails() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const results = document.querySelector('#results');

    function attachPDFButton(datosReserva) {
        document.getElementById("btn-descargar-pdf").addEventListener("click", () => {
            generarPDFComprobante(datosReserva);
        });
    }

    if (sessionId) {
        fetch(`https://hotel-backend-3jw7.onrender.com/stripe-session?session_id=${sessionId}`)
            .then(res => res.json())
            .then(data => {
                if (data.reserva) {
                    const r = data.reserva;
                    results.innerHTML = `
                        <h2>✅ ¡Reserva confirmada con pago por tarjeta!</h2>
                        <p><strong>Número de Reserva:</strong> ${r.numeroTransferencia || 'No aplica'}</p>
                        <p>Gracias por tu reserva, ${r.fullGuestName}</p>
                        <p><strong>Check-in:</strong> ${r.checkin}</p>
                        <p><strong>Check-out:</strong> ${r.checkout}</p>
                        <p><strong>Habitación:</strong> ${r.cuarto}</p>
                        <p><strong>Correo:</strong> ${r.email}</p>
                        <p><strong>Teléfono:</strong> ${r.phone}</p>
                        <p><strong>Pago con:</strong> Tarjeta (Stripe)</p>
                        <button id="btn-descargar-pdf" class="btn-pdf">📄 Descargar comprobante</button>
                    `;

                    attachPDFButton({
                        nombre: r.fullGuestName,
                        email: r.email,
                        telefono: r.phone,
                        checkin_date: r.checkin,
                        checkout_date: r.checkout,
                        room_name: r.cuarto,
                        total: r.total || 'No especificado',
                        reservationid: r.numeroTransferencia || 'No aplica',
                        metodo_pago: 'tarjeta',
                        special_requests: r.specialRequests || 'Ninguna',
                        arrival_time: r.arrivalTime || 'No especificada'
                    });
                } else {
                    results.innerHTML = `<p>❌ No se encontraron los datos de la reserva.</p>`;
                }
            })
            .catch(err => {
                console.error("Error al consultar sesión de Stripe:", err);
                results.innerHTML = `<p>❌ Error al obtener la información de tu reserva. Intenta más tarde.</p>`;
            });
    } else {
        const myInfo = new URLSearchParams(window.location.search);
        const metodoPago = myInfo.get('metodoPago') || 'efectivo';
        const numeroTransferencia = myInfo.get('numeroTransferencia') || 'No aplica';

        const titulo =
            metodoPago === 'transferencia'
                ? '✅ ¡Reserva confirmada con pago por transferencia!'
                : metodoPago === 'efectivo'
                    ? '✅ ¡Reserva confirmada con pago en efectivo!'
                    : '✅ ¡Reserva confirmada!';

        results.innerHTML = `
            <h2>${titulo}</h2>
            <p><strong>Número de Reserva:</strong> ${numeroTransferencia}</p>
            <p>Gracias por tu reserva, ${myInfo.get('fullGuestName')}</p>
            <p><strong>Check-in:</strong> ${myInfo.get('checkin')}</p>
            <p><strong>Check-out:</strong> ${myInfo.get('checkout')}</p>
            <p><strong>Teléfono:</strong> ${myInfo.get('phone')}</p>
            <p><strong>Habitación:</strong> ${myInfo.get('cuarto') || 'No especificada'}</p>
            <p><strong>Solicitudes especiales:</strong> ${myInfo.get('specialRequests') || 'Ninguna'}</p>
            <p><strong>Hora de llegada:</strong> ${myInfo.get('arrivalTime') || 'No especificada'}</p>
            <p><strong>Método de pago:</strong> ${metodoPago}</p>
            <button id="btn-descargar-pdf" class="btn-pdf">📄 Descargar comprobante</button>
        `;

        attachPDFButton({
            nombre: myInfo.get('fullGuestName'),
            email: myInfo.get('email') || 'No especificado',
            telefono: myInfo.get('phone') || 'No especificado',
            checkin_date: myInfo.get('checkin'),
            checkout_date: myInfo.get('checkout'),
            room_name: myInfo.get('cuarto') || 'No especificada',
            total: myInfo.get('total') || 'No especificado',
            reservationid: numeroTransferencia,
            metodo_pago: metodoPago,
            special_requests: myInfo.get('specialRequests') || 'Ninguna',
            arrival_time: myInfo.get('arrivalTime') || 'No especificada'
        });
    }
}

async function generarPDFComprobante(datosReserva) {
    try {
        const response = await fetch("https://hotel-backend-3jw7.onrender.com/api/generate-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosReserva),
        });

        if (!response.ok) throw new Error("No se pudo generar el PDF");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "comprobante.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error al descargar PDF:", error);
    }
}

