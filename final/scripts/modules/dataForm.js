export function dataForm() {
    const data = JSON.parse(localStorage.getItem("selectedRoom"));
    data.price = Number(data.price.replace(/[^\d.]/g, '')) || 0;


    if (!data) return;

    const preview = document.getElementById("selected-room-preview");
    preview.innerHTML = `
        <div id="room-preview">
            <h2>${data.name}</h2>
            
            <img src="${data.image}" alt="${data.name}" loading="lazy" width="960" height="720">
            <p>Precio: ${data.price}</p>
        </div>

        <form method="POST" id="reservation-form">
            <h3>Ingresa tus datos</h3>
            <p>¡Ya casi terminas! Completa la información marcada con <strong>*</strong></p>

            <!-- Fechas de reserva -->
            <fieldset>
                <legend>Fechas de reserva</legend>
                <label>
                    Fecha de entrada (Check-in)*
                    <input type="date" name="checkin" id="checkin" required>
                </label>
                <label>
                    Fecha de salida (Check-out)*
                    <input type="date" name="checkout" id="checkout" required>
                </label>
                <p><strong>Total a pagar:</strong> <span id="total-price">$0</span></p>
            </fieldset>

            <!-- Datos personales -->
            <fieldset>
            <legend>Datos Personales</legend>
            <label>Nombre* <input type="text" name="firstName" required autocomplete="given-name"></label>
            <label>Apellido* <input type="text" name="lastName" required autocomplete="family-name"></label>
            <label>Email* <small>Se enviará la confirmación a este correo</small><input type="email" name="email" required required autocomplete="email"></label>
            

            <label>Teléfono* <input type="tel" name="phone" required autocomplete="tel"></label>

            <label>País/Región*
                <select name="country" required autocomplete="country">
                    <option value="Ecuador">Ecuador</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Otro">Otro</option>
                </select>
            </label>

            <label>
                <input type="checkbox" name="paperlessConfirm" checked autocomplete="section-reservation paperless-confirm">
                Sí, quiero confirmación digital gratuita (recomendado)
            </label>
            </fieldset>

            <fieldset>
            <legend>Opcional</legend>
                <label>¿Para quién es la reserva?</label>
                <label><input type="radio" name="bookingFor" value="Si" checked autocomplete="off"> Soy el huésped principal</label>
                <label><input type="radio" name="bookingFor" value="Estoy reservando para otra persona" autocomplete="off"> Estoy reservando para otra persona</label>
           
                <label>¿Viajas por trabajo?</label>
                <label><input type="radio" name="travelForWork" value="yes" autocomplete="off"> Sí</label>
                <label><input type="radio" name="travelForWork" value="no" checked autocomplete="off"> No</label>

                <label>¿Tienes solicitudes especiales?
                <textarea name="specialRequests" placeholder="..." autocomplete="off"></textarea>
            </label>

            <label>Hora estimada de llegada (opcional)
                <select name="arrivalTime" autocomplete="off">
                    <option value="">Selecciona una hora</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                </select>
                <small>Check-in disponible entre las 15:00 y 18:00 (zona horaria de Playas)</small>
            </label>
            </fieldset>

            <fieldset>
                <legend>Agrega a tu reserva</legend>
                <label><input type="checkbox" name="addFlights" autocomplete="off"> Vuelos (te mostraremos opciones en la confirmación)</label>
                <label><input type="checkbox" name="addCar" autocomplete="off"> Renta de autos</label>
                <label><input type="checkbox" name="addTaxi" autocomplete="off"> Taxis privados desde el aeropuerto</label>
            </fieldset>

            <div id="info-box">
                <h4>Información importante:</h4>
                <ul>
                    <li>¡Tendrás toda la suite para ti!</li>
                    <li>No se requiere pago anticipado. Se paga durante la estancia.</li>
                    <li><strong>Suite:</strong> Cancelación gratuita hasta el primer día</li>
                    <li><strong>Huéspedes:</strong> 7 adultos</li>
                    <li><strong>No se permite fumar</strong></li>
                </ul>
            </div>
            <div>
              <label for="metodoPago">Método de pago:</label>
              <select id="metodoPago" name="metodoPago">
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta (Protected by Security-Stripe)</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <p><strong>Total estimado:</strong> <span id="total-price-copy">$0</span></p>


            <label>Firma <input type="text" name="fullGuestName" placeholder="Nombre completo del huésped" autocomplete="name"></label>

            <button type="submit" id="submitBtn">Confirmar reserva</button>

        </form>
    `;
    if (!document.getElementById("contador-overlay")) {
        const overlay = document.createElement("div");
        overlay.id = "contador-overlay";
        overlay.style = `
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(0, 0, 0, 0.3);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const modal = document.createElement("div");
        modal.id = "contador-modal";
        modal.style = `
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 90%;
            font-size: 1.2rem;
        `;

        modal.innerHTML = `
            <p id="contador-mensaje" style="margin-bottom: 1rem;"></p>
            <p style="font-size: 1.5rem;">Redirigiendo en <span id="contador">20</span> segundos...</p>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    const metodoPagoSelect = document.getElementById("metodoPago");
    const submitBtn = document.getElementById("submitBtn");

    metodoPagoSelect.addEventListener("change", () => {
        const metodo = metodoPagoSelect.value;

        if (metodo === "efectivo") {
            submitBtn.textContent = "Confirmar reserva";
        } else if (metodo === "tarjeta") {
            submitBtn.textContent = "Continuar";
        } else if (metodo === "transferencia") {
            submitBtn.textContent = "Continuar";
        }
        const transferenciaInfo = document.getElementById("transferencia-info");
        if (transferenciaInfo && metodo !== "transferencia") {
            transferenciaInfo.remove();
            localStorage.removeItem("numeroTransferencia");
        }
    });
    // Ejecutar al inicio para que el texto esté correcto desde el principio
    metodoPagoSelect.dispatchEvent(new Event("change"));

    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    const totalPriceDisplay = document.getElementById("total-price");
    const totalPriceCopy = document.getElementById("total-price-copy");

    let totalReserva = 0;

    function calcularTotal() {
        const checkinDate = new Date(checkinInput.value);
        const checkoutDate = new Date(checkoutInput.value);
        if (!isNaN(checkinDate) && !isNaN(checkoutDate) && checkoutDate > checkinDate) {
            const dias = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
            totalReserva = dias * data.price;
            totalPriceDisplay.textContent = `$${totalReserva}`;
            totalPriceCopy.textContent = `$${totalReserva}`;
        } else {
            totalReserva = 0;
            totalPriceDisplay.textContent = "$0";
            totalPriceCopy.textContent = "$0"
        }
    }

    checkinInput.addEventListener("change", calcularTotal);
    checkoutInput.addEventListener("change", calcularTotal);

    function mostrarContador(mensaje) {
        let contador = 35;
        const overlay = document.getElementById("contador-overlay");
        const mensajeElem = document.getElementById("contador-mensaje");
        const contadorElem = document.getElementById("contador");

        if (!overlay || !mensajeElem || !contadorElem) return;

        mensajeElem.textContent = mensaje;
        contadorElem.textContent = contador;
        overlay.style.display = "flex";

        const intervalo = setInterval(() => {
            contador--;
            contadorElem.textContent = contador;
            if (contador <= 0) clearInterval(intervalo);
        }, 1000);
    }

    const form = document.getElementById("reservation-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const metodoPago = form.metodoPago.value;

        // Justo dentro del eventListener del submit
        if (metodoPago === "transferencia") {
            e.preventDefault(); // Detiene el envío normal

            // Evita mostrar múltiples veces
            if (document.querySelector('#transferencia-info')) return;

            const numeroTransferencia = Math.floor(100000 + Math.random() * 900000);

            // Guardamos temporalmente en memoria
            localStorage.setItem("numeroTransferencia", numeroTransferencia);

            const transferenciaInfo = document.createElement("div");
            transferenciaInfo.id = "transferencia-info";
            transferenciaInfo.innerHTML = `
        <h3 style="margin-top: 1rem; font-size: 1.3rem;">Instrucciones para la transferencia</h3>
        <p>Por favor realiza la transferencia bancaria en uno de los siguientes bancos, incluyendo el siguiente número en la descripción de la transferencia, de esta manera podremos localizar tu reserva en nuestro sistema de verificacion de pagos:</p>
        <p style="text-align: center;"><strong style="font-size: 1.8rem; color: #333;">${numeroTransferencia}</strong></p>
        <p>Una vez que completes la transferencia, haz clic en <strong>"Confirmar reserva"</strong> más abajo y listo! tu reserva sera confirmada automaticamente.</p>

        <div style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; margin-top: 1.5rem;">
            <div style="text-align: center;">
                <img src="https://placeholdit.com/150x150/2b2626/f0ebeb?text=QR+CODE" alt="Banco 1" width="180" style="border-radius: 8px;" />
                <p>Cuenta Banco 1</p>
            </div>
            <div style="text-align: center;">
                <img src="https://placeholdit.com/150x150/2b2626/f0ebeb?text=QR+CODE" alt="Banco 2" width="180" style="border-radius: 8px;" />
                <p>Cuenta Banco 2</p>
            </div>
            <div style="text-align: center;">
                <img src="https://placeholdit.com/150x150/2b2626/f0ebeb?text=QR+CODE" alt="Banco 3" width="180" style="border-radius: 8px;" />
                <p>Cuenta Venmo</p>
            </div>
        </div>
        <p>Nota: Para ofrecerte una mejor experiencia nuestro sistema de verificacion de pagos con transferencia 
        verificara que la transferencia se haya completado correctamente despues de que tu confirmes la reserva. Si hubo algun problema con tu transferencia un miembro de nuestro equipo se contactara contigo por correo electronico dentro de 1 hora con futuras indicaciones sobre como
        completar la transferencia exitosamente. (Si no nos contactamos contigo dentro de una hora, significa que todo salio bien con la transferencia y te estaremos esperando en Maribao!.)</p>
            
        <button id="confirmar-transferencia" type="button" style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background-color: #007bff; color: white; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer;">
            Confirmar reserva
        </button>
    `;

            form.appendChild(transferenciaInfo);

            // Agregar listener al botón de confirmar reserva
            document.querySelector("#confirmar-transferencia").addEventListener("click", async () => {
                mostrarContador("Gracias por reservar con nosotros. Tu reserva se está procesando, esto solo tomará unos segundos.");
                const numeroTransferencia = localStorage.getItem("numeroTransferencia");

                const formData = {
                    checkin: form.checkin.value,
                    checkout: form.checkout.value,
                    firstName: form.firstName.value,
                    lastName: form.lastName.value,
                    email: form.email.value,
                    phone: form.phone.value,
                    country: form.country.value,
                    paperlessConfirm: form.paperlessConfirm.checked,
                    bookingFor: form.bookingFor.value,
                    travelForWork: form.travelForWork.value,
                    specialRequests: form.specialRequests.value,
                    arrivalTime: form.arrivalTime.value,
                    addFlights: form.addFlights.checked,
                    addCar: form.addCar.checked,
                    addTaxi: form.addTaxi.checked,
                    fullGuestName: form.fullGuestName.value,
                    cuarto: data.name,
                    metodoPago: "transferencia",
                    numeroTransferencia: numeroTransferencia,
                    total: totalReserva
                };

                try {
                    const response = await fetch("https://hotel-backend-3jw7.onrender.com/reserva", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData),
                    });

                    const result = await response.json();

                    if (result.success) {
                        localStorage.setItem("reservaConfirmada", JSON.stringify({
                            numeroReserva: result.numeroReserva,
                            fullName: `${formData.firstName} ${formData.lastName}`,
                            cuarto: data.name,
                            checkin: formData.checkin,
                            checkout: formData.checkout,
                            total: totalReserva
                        }));

                        const params = new URLSearchParams({ ...formData });
                        localStorage.removeItem("numeroTransferencia");

                        window.location.href = `thanks.html?${params.toString()}`;
                    } else {
                        alert("No se pudo completar la reserva. Intenta nuevamente.");
                    }

                } catch (error) {
                    console.error("Error al enviar reserva por transferencia:", error);
                    alert("Error al conectar con el servidor.");
                }
            });

            return; // Evita que se siga procesando el submit normal
        }
        const formData = {
            checkin: form.checkin.value,
            checkout: form.checkout.value,
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            email: form.email.value,
            phone: form.phone.value,
            country: form.country.value,
            paperlessConfirm: form.paperlessConfirm.checked,
            bookingFor: form.bookingFor.value,
            travelForWork: form.travelForWork.value,
            specialRequests: form.specialRequests.value,
            arrivalTime: form.arrivalTime.value,
            addFlights: form.addFlights.checked,
            addCar: form.addCar.checked,
            addTaxi: form.addTaxi.checked,
            fullGuestName: form.fullGuestName.value,
            cuarto: data.name,
            metodoPago: metodoPago,
            numeroTransferencia: "No aplica",
            total: totalReserva
        };
        if (metodoPago === "tarjeta") {
            mostrarContador("Gracias por reservar con nosotros. Serás redirigido a la plataforma de pagos en unos segundos.");
            // PAGO CON TARJETA (Stripe)
            try {
                const idReservaTemporal = Math.floor(100000 + Math.random() * 900000);

                const response = await fetch("https://hotel-backend-3jw7.onrender.com/create-checkout-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: totalReserva * 100, // Ajusta si usas precios reales
                        currency: "usd",
                        description: `Reserva para ${formData.firstName} ${formData.lastName}`,
                        metadata: {
                            reservaId: idReservaTemporal,
                            datosReserva: JSON.stringify(formData)
                        }
                    }),
                });

                const result = await response.json();

                if (result.url) {
                    window.location.href = result.url;
                } else {
                    alert("No se pudo iniciar el pago con tarjeta.");
                }
            } catch (error) {
                console.error("Error iniciando pago con Stripe:", error);
                alert("Error al procesar el pago. Intenta de nuevo.");
            }

        } else {
            mostrarContador("Gracias por reservar con nosotros. Tu reserva se está procesando, esto solo tomará unos segundos.");
            // Pago en efectivo
            try {
                const response = await fetch("https://hotel-backend-3jw7.onrender.com/reserva", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (result.success) {

                    localStorage.setItem("reservaConfirmada", JSON.stringify({
                        numeroReserva: result.numeroReserva,
                        fullName: `${form.firstName.value} ${form.lastName.value}`,
                        cuarto: data.name,
                        checkin: form.checkin.value,
                        checkout: form.checkout.value,
                        total: totalReserva
                    }));

                    const params = new URLSearchParams({
                        checkin: form.checkin.value,
                        checkout: form.checkout.value,
                        firstName: form.firstName.value,
                        lastName: form.lastName.value,
                        email: form.email.value,
                        phone: form.phone.value,
                        country: form.country.value,
                        paperlessConfirm: form.paperlessConfirm.checked,
                        bookingFor: form.bookingFor.value,
                        travelForWork: form.travelForWork.value,
                        fullGuestName: form.fullGuestName.value,
                        specialRequests: form.specialRequests.value,
                        arrivalTime: form.arrivalTime.value,
                    });
                    if (metodoPago === 'transferencia' && numeroTransferencia) {
                        params.append("numeroTransferencia", numeroTransferencia);
                    }
                    window.location.href = `thanks.html?${params.toString()}`;
                } else {
                    alert("Error al procesar la reserva. Intenta de nuevo.");
                }
            } catch (error) {
                console.error("Error al conectar con el servidor:", error);
                alert("No se pudo conectar con el servidor. Intenta más tarde.");
            }
        }



    });


}

