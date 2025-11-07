export function thanksdetails() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const results = document.querySelector('#results');

    function attachPDFButton(datosReserva) {
    document.getElementById("btn-descargar-pdf").addEventListener("click", async () => {

        showPDFModal();

        localStorage.setItem("clientName", datosReserva.nombre);
        localStorage.setItem("lastDownloadDate", new Date().toISOString());
        updateLastDownloadMessage();

        const pdfUrl = await generarPDFComprobante(datosReserva);


        setTimeout(() => {
            window.open(pdfUrl, '_blank');
        }, 3000);
    });
        
    updateLastDownloadMessage();
        
    }

    function updateLastDownloadMessage() {
      const name = localStorage.getItem("clientName");
      const date = localStorage.getItem("lastDownloadDate");

      let infoElement = document.querySelector("#last-download-info");

      if (!infoElement) {
        infoElement = document.createElement("p");
        infoElement.id = "last-download-info";
        document.querySelector("#btn-descargar-pdf")?.after(infoElement);
      }

      if (name && date) {
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('es-ES', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const formattedTime = dateObj.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        infoElement.textContent = `${name}, la última vez que descargaste tu comprobante fue ${formattedDate} a las ${formattedTime}`;
      } else {
        infoElement.textContent = "";
      }
    }



    function showPDFModal() {
      let count = parseInt(localStorage.getItem('pdfDownloadCount')) || 0;
      count += 1;
      localStorage.setItem('pdfDownloadCount', count);

      let mensaje = 'PDF descargado ✅';
      if (count === 2) mensaje = 'PDF descargado segunda vez ✅';
      else if (count === 3) mensaje = 'PDF descargado tercera vez ✅';
      else if (count > 3) mensaje = `PDF descargado ${count} veces ✅`;

      let modal = document.createElement('div');
      modal.id = 'pdf-modal';
      modal.innerHTML = `<div class="modal-content">${mensaje}</div>`;
      document.body.appendChild(modal);

      setTimeout(() => {
        modal.remove();
      }, 3000);
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
                ? '✅ Reserva en proceso'
                : metodoPago === 'efectivo'
                    ? '✅ Reserva en proceso'
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
            <h3 style="margin-top: 1rem; font-size: 1.3rem;">Instrucciones para la transferencia</h3>
        <p>Por favor realiza la transferencia bancaria en uno de los siguientes bancos, incluyendo el siguiente número en la descripción de la transferencia, de esta manera podremos localizar tu reserva.</p>
        <p style="text-align: center;"><strong style="font-size: 1.8rem; color: #333;">${numeroTransferencia}</strong></p>
        <p>Una vez que completes la transferencia, adicional a esto tendras que enviar una captura de pantalla mostrando los datos de la transferencia, asegurate de incluir tu numero de reserva en la descripcion de tu transferencia y la cantidad transferida, sea parcial (abonada), o sea total (completa).</p>
        <p>Puedes enviar tu comprobante de transferencia (captura de pantalla) a nuestro correo electronico **, o simplemente a nuestro whatsap "Paraiso Maribao", que puedes encontrarlo haciendo click en el icono de whatsap en la esquina inferior derecha de esta o cualquier pagina.</p>
        <p>Abono mitad:${myInfo.get('abonoMitad')}</p>
        <p>Monto total:${myInfo.get('totalFormateado')}</p>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; margin-top: 1.5rem;">
            <div style="text-align: center;">
                <img src="images/qrcode1.webp" alt="Banco 1" width="180" style="border-radius: 8px;" />
                <p>Banco del Pacifico</p>
            </div>
            <div style="text-align: center;">
                <img src="images/qrcode2.webp" alt="Banco 2" width="180" style="border-radius: 8px;" />
                <p>Banco de Guayaquil</p>
            </div>
        </div>
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
        return url;

    } catch (error) {
        console.error("Error al descargar PDF:", error);
    }
}

function addIphoneHelpButton() {
  const pdfButton = document.getElementById("btn-descargar-pdf");
  if (!pdfButton) return;

  const iphoneBtn = document.createElement("button");
  iphoneBtn.id = "btn-iphone-help";
  iphoneBtn.textContent = "📱 Para dispositivos iPhone";
  iphoneBtn.classList.add("btn-iphone");

  pdfButton.insertAdjacentElement("afterend", iphoneBtn);

  const modal = document.createElement("div");
  modal.id = "iphone-modal";
  modal.classList.add("hidden");
  modal.innerHTML = `
    <div class="iphone-modal-content">
      <h3>📄 Cómo guardar tu comprobante en iPhone</h3>
      <ol>
        <li> Cierra este mensaje y haz clic en el botón <strong>"Descargar comprobante"</strong>.</li>
        <li> iPhone mostrará automáticamente una vista previa de tu comprobante.</li>
        <li> En la parte inferior de Safari, selecciona el ícono de <strong>Compartir</strong>.</li>
        <li> Desliza hacia abajo y elige <strong>"Guardar en Archivos"</strong> o <strong>"Save to Files"</strong>.</li>
      </ol>
      <button id="close-iphone-modal" class="btn-close-iphone">Cerrar</button>
    </div>
  `;
  document.body.appendChild(modal);

  iphoneBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  document.getElementById("close-iphone-modal").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => addIphoneHelpButton(), 1000);
});

