export function dataForm() {
    const data = JSON.parse(localStorage.getItem("selectedRoom"));
    if (!data) return;

    const preview = document.getElementById("selected-room-preview");
    preview.innerHTML = `
        <div id="room-preview">
            <h2>${data.name}</h2>
            
            <img src="${data.image}" alt="${data.name}" loading="lazy" width="960" height="720">
        </div>

        <form method="POST" id="reservation-form">
            <h3>Ingresa tus datos</h3>
            <p>¡Ya casi terminas! Completa la información marcada con <strong>*</strong></p>

            <!-- Fechas de reserva -->
            <fieldset>
                <legend>Fechas de reserva</legend>
                <label>
                    Fecha de entrada (Check-in)*
                    <input type="date" name="checkin" required>
                </label>
                <label>
                    Fecha de salida (Check-out)*
                    <input type="date" name="checkout" required>
                </label>
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
                <option value="tarjeta">Tarjeta (Stripe)</option>
              </select>
            </div>


            <label>Firma <input type="text" name="fullGuestName" placeholder="Nombre completo del huésped" autocomplete="name"></label>

            <button type="submit">Confirmar reserva</button>
        </form>
    `;
    const form = document.getElementById("reservation-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const metodoPago = form.metodoPago.value;

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
            metodoPago: metodoPago
        };

        if (metodoPago === "tarjeta") {
            // PAGO CON TARJETA (Stripe)
            try {
                const idReservaTemporal = Math.floor(100000 + Math.random() * 900000);

                const response = await fetch("https://hotel-backend-3jw7.onrender.com/create-checkout-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: 5000, // Ajusta si usas precios reales
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
            // Pago en efectivo
            try {
                const response = await fetch("https://hotel-backend-3jw7.onrender.com/reserva", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (result.success) {
                    alert(`Reserva confirmada! Tu número de reserva es: ${result.numeroReserva}`);

                    localStorage.setItem("reservaConfirmada", JSON.stringify({
                        numeroReserva: result.numeroReserva,
                        fullName: `${form.firstName.value} ${form.lastName.value}`,
                        cuarto: data.name,
                        checkin: form.checkin.value,
                        checkout: form.checkout.value,
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

