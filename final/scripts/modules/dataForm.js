export function dataForm() {
    const data = JSON.parse(localStorage.getItem("selectedRoom"));
    if (!data) return;

    const preview = document.getElementById("selected-room-preview");
    preview.innerHTML = `
        <div id="room-preview">
            <h2>${data.name}</h2>
            
            <img src="${data.image}" alt="${data.name}" loading="lazy" width="960" height="720">
        </div>

        <form method="GET" action="thanks.html" id="reservation-form">
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
            <label>Nombre* <input type="text" name="firstName" required autocomplete="given-name"></label>
            <label>Apellido* <input type="text" name="lastName" required required autocomplete="family-name"></label>
            <label>Email* <input type="email" name="email" required required autocomplete="email"></label>
            <small>Se enviará la confirmación a este correo</small>

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
            <small>Te enviaremos un enlace para descargar nuestra app</small>

            <fieldset>
                <legend>¿Para quién es la reserva? (opcional)</legend>
                <label><input type="radio" name="bookingFor" value="Si" checked autocomplete="off"> Soy el huésped principal</label>
                <label><input type="radio" name="bookingFor" value="Estoy reservando para otra persona" autocomplete="off"> Estoy reservando para otra persona</label>
            </fieldset>

            <fieldset>
                <legend>¿Viajas por trabajo? (opcional)</legend>
                <label><input type="radio" name="travelForWork" value="yes" autocomplete="off"> Sí</label>
                <label><input type="radio" name="travelForWork" value="no" checked autocomplete="off"> No</label>
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

            <label>Nombre completo del huésped <input type="text" name="fullGuestName" placeholder="Nombre y apellido" autocomplete="name"></label>

            <fieldset>
                <legend>Agrega a tu reserva</legend>
                <label><input type="checkbox" name="addFlights" autocomplete="off"> Vuelos (te mostraremos opciones en la confirmación)</label>
                <label><input type="checkbox" name="addCar" autocomplete="off"> Renta de autos</label>
                <label><input type="checkbox" name="addTaxi" autocomplete="off"> Taxis privados desde el aeropuerto</label>
            </fieldset>

            <label>¿Tienes solicitudes especiales? (opcional)
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

            <button type="submit">Confirmar reserva</button>
        </form>
    `;
}

