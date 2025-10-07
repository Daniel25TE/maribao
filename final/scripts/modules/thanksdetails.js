export function thanksdetails() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const results = document.querySelector('#results');

    if (sessionId) {
        fetch(`https://hotel-backend-3jw7.onrender.com/stripe-session?session_id=${sessionId}`)
            .then(res => res.json())
            .then(data => {
                if (data.reserva) {
                    const reserva = data.reserva;

                    results.innerHTML = `
                        <h2>✅ ¡Reserva confirmada con pago por tarjeta!</h2>
                        <p><strong>Número de Reserva:</strong> ${reserva.numeroTransferencia || 'No aplica'}</p>
                        <p>Gracias por tu reserva, ${reserva.firstName} ${reserva.lastName}.</p>
                        <p><strong>Check-in:</strong> ${reserva.checkin}</p>
                        <p><strong>Check-out:</strong> ${reserva.checkout}</p>
                        <p><strong>Habitación:</strong> ${reserva.cuarto}</p>
                        <p><strong>Correo:</strong> ${reserva.email}</p>
                        <p><strong>Teléfono:</strong> ${reserva.phone}</p>
                        <p><strong>Pago con:</strong> Tarjeta (Stripe)</p>
                        <button id="btn-descargar-pdf" class="btn-pdf">📄 Descargar comprobante</button>
                    `;

                    document.getElementById("btn-descargar-pdf").addEventListener("click", () => {
                        generarPDFComprobante({
                            nombre: reserva.firstName + ' ' + reserva.lastName,
                            email: reserva.email,
                            telefono: reserva.phone,
                            checkin_date: reserva.checkin,
                            checkout_date: reserva.checkout,
                            room_name: reserva.cuarto,
                            total: reserva.total || 'No especificado',
                            reservationid: reserva.numeroTransferencia || 'No aplica',
                            metodo_pago: 'tarjeta',
                            special_requests: reserva.specialRequests || 'Ninguna',
                            arrival_time: reserva.arrivalTime || 'No especificada'
                        });
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
            <p>Gracias por tu reserva, ${myInfo.get('firstName')} ${myInfo.get('lastName')}</p>
            <p><strong>Check-in:</strong> ${myInfo.get('checkin')}</p>
            <p><strong>Check-out:</strong> ${myInfo.get('checkout')}</p>
            <p><strong>Teléfono:</strong> ${myInfo.get('phone')}</p>
            <p><strong>Reserva a nombre de:</strong> ${myInfo.get('fullGuestName')}</p>
            <p><strong>Habitación:</strong> ${myInfo.get('room_name') || 'No especificada'}</p>
            <p><strong>Solicitudes especiales:</strong> ${myInfo.get('specialRequests') || 'Ninguna'}</p>
            <p><strong>Hora de llegada:</strong> ${myInfo.get('arrivalTime') || 'No especificada'}</p>
            <p><strong>Método de pago:</strong> ${metodoPago}</p>
            <button id="btn-descargar-pdf" class="btn-pdf">📄 Descargar comprobante</button>
        `;

        document.getElementById("btn-descargar-pdf").addEventListener("click", () => {
            generarPDFComprobante({
                nombre: myInfo.get('firstName') + ' ' + myInfo.get('lastName'),
                email: myInfo.get('email') || 'No especificado',
                telefono: myInfo.get('phone') || 'No especificado',
                checkin_date: myInfo.get('checkin'),
                checkout_date: myInfo.get('checkout'),
                room_name: myInfo.get('room_name') || 'No especificada',
                total: myInfo.get('total') || 'No especificado',
                reservationid: numeroTransferencia,
                metodo_pago: metodoPago,
                special_requests: myInfo.get('specialRequests') || 'Ninguna',
                arrival_time: myInfo.get('arrivalTime') || 'No especificada'
            });
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
