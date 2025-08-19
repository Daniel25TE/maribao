export function thanksdetails() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const results = document.querySelector('#results');

    if (sessionId) {
        // ✅ Pago con tarjeta: obtener los datos desde el backend usando el session_id
        fetch(`https://hotel-backend-3jw7.onrender.com/stripe-session?session_id=${sessionId}`)
            .then(res => res.json())
            .then(data => {
                if (data.reserva) {
                    const reserva = data.reserva;

                    results.innerHTML = `
                        <h2>✅ ¡Reserva confirmada con pago por tarjeta!</h2>
                        <p>Gracias por tu reserva, ${reserva.firstName} ${reserva.lastName}.</p>
                        <p><strong>Check-in:</strong> ${reserva.checkin}</p>
                        <p><strong>Check-out:</strong> ${reserva.checkout}</p>
                        <p><strong>Habitación:</strong> ${reserva.cuarto}</p>
                        <p><strong>Correo:</strong> ${reserva.email}</p>
                        <p><strong>Teléfono:</strong> ${reserva.phone}</p>
                        <p><strong>Pago con:</strong> Tarjeta (Stripe)</p>
                        <p><strong>Número de transferencia:</strong> ${reserva.numeroTransferencia || 'No aplica'}</p>
                    `;
                } else {
                    results.innerHTML = `<p>❌ No se encontraron los datos de la reserva.</p>`;
                }
            })
            .catch(err => {
                console.error("Error al consultar sesión de Stripe:", err);
                results.innerHTML = `<p>❌ Error al obtener la información de tu reserva. Intenta más tarde.</p>`;
            });

    } else {
        // ✅ Reserva con efectivo o transferencia
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
            <p><strong>Número de transferencia:</strong> ${numeroTransferencia}</p>
            <p>Gracias por tu reserva, ${myInfo.get('firstName')} ${myInfo.get('lastName')}</p>
            <p><strong>Check-in:</strong> ${myInfo.get('checkin')}</p>
            <p><strong>Check-out:</strong> ${myInfo.get('checkout')}</p>
            <p><strong>Teléfono:</strong> ${myInfo.get('phone')}</p>
            <p><strong>Reserva a nombre de:</strong> ${myInfo.get('fullGuestName')}</p>
            <p><strong>Solicitudes especiales:</strong> ${myInfo.get('specialRequests') || 'Ninguna'}</p>
            <p><strong>Hora de llegada:</strong> ${myInfo.get('arrivalTime') || 'No especificada'}</p>
            <p><strong>Método de pago:</strong> ${metodoPago}</p>
        `;
    }
}
