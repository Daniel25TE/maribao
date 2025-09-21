const SUPABASE_URL = "https://ceggjyfcazathwqazmtp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZ2dqeWZjYXphdGh3cWF6bXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDA2OTcsImV4cCI6MjA2NjAxNjY5N30.ZD6_6Cactwxm3Rfr0_pKpMEw_4jEzQvhFFHBwmdQJOc";


const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function dataForm() {
    const data = JSON.parse(localStorage.getItem("selectedRoom") || "{}");

    if (!data || Object.keys(data).length === 0) return;

    // 🔹 Ajustar precio (limpia símbolos como $, , etc.)
    data.price = Number(data.price?.toString().replace(/[^\d.]/g, '')) || 0;

    // 🔹 Obtener el contenedor una sola vez
    const preview = document.getElementById("selected-room-preview");
    preview.innerHTML = `
        <div id="room-preview">
            <h2>${data.name}</h2>
            
            <img src="${data.image}" alt="${data.name}" loading="lazy" width="960" height="720">
            <p>Precio: $${data.price} x noche</p>
        </div>

        <form method="POST" id="reservation-form">
            <h3>Ingresa tus datos</h3>
            <p>¡Ya casi terminas! Completa la información marcada con <strong>*</strong></p>

            <!-- Fechas de reserva -->
            <fieldset>
                <legend>Fechas de reserva</legend>
                <label>
                    Fecha de entrada (Check-in)*
                    <input type="text" name="checkin" id="checkin" required>
                </label>
                <label>
                    Fecha de salida (Check-out)*
                    <input type="text" name="checkout" id="checkout" required>
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
            <label>Hora estimada de llegada*
                <select name="arrivalTime" required autocomplete="off">
                    <option value="">Selecciona una hora</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                </select>
                <small>Check-in disponible a partir de las 14:00 (zona horaria de Playas)</small>
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

            
            </fieldset>

            <div id="info-box">
                <h4>Información importante:</h4>
                <ul>
                    <li>Se requiere pago anticipado.</li>
                    <li><strong>Checkout:</strong> El checkout es antes de las 12:00 p.m.</li>
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
    if (data.people) {
        const peopleSummary = document.createElement("p");
        peopleSummary.id = "people-summary";
        peopleSummary.textContent = `${data.people} ${data.people === 1 ? "persona" : "personas"}`;
        preview.querySelector("#room-preview").appendChild(peopleSummary);
    }
    async function cargarFechasOcupadas(roomName, discountsMap = {}) {
    try {
        const { data: fechas, error } = await supabaseClient
            .from("reservas")
            .select("checkin_date, checkout_date")
            .eq("room_name", roomName);

        if (error) {
            console.error("❌ Error cargando fechas ocupadas:", error);
            return;
        }

        const rangosBloqueados = fechas.map(f => ({
            from: f.checkin_date,
            to: f.checkout_date
        }));

        console.log(`📅 Fechas ocupadas para ${roomName}:`, rangosBloqueados);
        console.log('📌 discountsMap:', discountsMap);

        // Helper para formatear fecha a yyyy-mm-dd
        const toYMD = d => d.toISOString().split('T')[0];

        // primer picker (checkin)
        flatpickr("#checkin", {
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
            minDate: "today",
            disable: rangosBloqueados,
            onDayCreate: function(dObj, dStr, fp, dayElem) {
    const dateKey = toYMD(dayElem.dateObj);
    const pct = discountsMap[dateKey];
    if (pct) {
        dayElem.classList.add('discount-day');
        const badge = document.createElement('span');
        badge.className = 'discount-badge';
        
        if (pct < 0) {
            badge.textContent = `${pct}%`; // descuento verde
            badge.style.backgroundColor = "#28a745";
        } else {
            badge.textContent = `+${pct}%`; // aumento rojo
            badge.style.backgroundColor = "#dc3545";
        }

        dayElem.appendChild(badge);
    }
}
,
            onChange: function (selectedDates, dateStr, instance) {
                if (selectedDates.length > 0) {
                    checkoutPicker.set("minDate", dateStr);
                }
            }
        });

        // segundo picker (checkout)
        const checkoutPicker = flatpickr("#checkout", {
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
            minDate: "today",
            disable: rangosBloqueados,
            onDayCreate: function(dObj, dStr, fp, dayElem) {
    const dateKey = toYMD(dayElem.dateObj);
    const pct = discountsMap[dateKey];
    if (pct) {
        dayElem.classList.add('discount-day');
        const badge = document.createElement('span');
        badge.className = 'discount-badge';
        
        if (pct < 0) {
            badge.textContent = `${pct}%`; // descuento verde
            badge.style.backgroundColor = "#28a745";
        } else {
            badge.textContent = `+${pct}%`; // aumento rojo
            badge.style.backgroundColor = "#dc3545";
        }

        dayElem.appendChild(badge);
    }
}

        });

    } catch (error) {
        console.error("❌ Error cargando fechas ocupadas:", error);
    }
}


    // cargar descuentos y luego inicializar el calendario
let discountsMap = {}; // mapa yyyy-mm-dd -> porcentaje

fetch('./data/discounts.json')
  .then(res => {
    if (!res.ok) throw new Error('No se pudo cargar discounts.json');
    return res.json();
  })
  .then(json => {
    discountsMap = json || {};
  })
  .catch(err => {
    console.warn('No se pudo cargar discounts.json, continua sin descuentos', err);
    discountsMap = {};
  })
  .finally(() => {
    // ahora que tenemos discountsMap (o vacío), pasamos al calendario
    cargarFechasOcupadas(data.name, discountsMap);
  });



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
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffDays = Math.ceil((checkoutDate - checkinDate) / msPerDay);

        // calculo por noche, aplicando descuentos por fecha
        let total = 0;
        const toYMD = d => d.toISOString().split('T')[0];

        for (let i = 0; i < diffDays; i++) {
            const night = new Date(checkinDate);
            night.setDate(checkinDate.getDate() + i);
            const key = toYMD(night);
            const pct = discountsMap[key] || 0; // usar discountsMap desde outer scope
            const nightlyPrice = data.price * (1 + pct / 100);
            total += nightlyPrice;
        }

        // redondear a 2 decimales
        totalReserva = Math.round((total + Number.EPSILON) * 100) / 100;

        totalPriceDisplay.textContent = `$${totalReserva}`;
        totalPriceCopy.textContent = `$${totalReserva}`;
    } else {
        totalReserva = 0;
        totalPriceDisplay.textContent = "$0";
        totalPriceCopy.textContent = "$0";
    }
}


    checkinInput.addEventListener("change", calcularTotal);
    checkoutInput.addEventListener("change", calcularTotal);

    function mostrarContador(mensaje) {
        const paymentMessage = document.getElementById("payment-message");

        if (!paymentMessage) return;

        let contador = 35;
        paymentMessage.style.display = 'block';
        paymentMessage.innerHTML = `
        <p>${mensaje}</p>
        <p>Procesando tu reserva en <span id="contador">${contador}</span> segundos...</p>
    `;

        const intervalo = setInterval(() => {
            contador--;
            const contadorEl = document.getElementById("contador");
            if (contadorEl) contadorEl.textContent = contador;

            if (contador <= 0) {
                clearInterval(intervalo);
            }
        }, 1000);
    }


    const form = document.getElementById("reservation-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const metodoPago = form.metodoPago.value;

        // 🔹 Generamos el número de transferencia siempre
        const numeroTransferencia = Math.floor(100000 + Math.random() * 900000);

        // Datos comunes a todos los métodos
        const formData = {
            checkin: form.checkin.value,
            checkout: form.checkout.value,
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            email: form.email.value,
            phone: form.phone.value,
            country: form.country.value,
            bookingFor: form.bookingFor.value,
            travelForWork: form.travelForWork.value,
            specialRequests: form.specialRequests.value,
            arrivalTime: form.arrivalTime.value,
            fullGuestName: form.fullGuestName.value,
            cuarto: data.name,
            metodoPago: metodoPago,
            numeroTransferencia: numeroTransferencia, // siempre presente
            total: totalReserva
        };

        if (metodoPago === "transferencia") {
            if (document.querySelector('#transferencia-info')) return;

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

            document.querySelector("#confirmar-transferencia").addEventListener("click", async () => {
                mostrarContador("Procesando tu reserva...");
                try {
                    const response = await fetch("https://hotel-backend-3jw7.onrender.com/reserva", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData),
                    });
                    const result = await response.json();
                    if (result.success) {
                        const params = new URLSearchParams(formData);
                        window.location.href = `thanks.html?${params.toString()}`;
                    } else {
                        alert("No se pudo completar la reserva.");
                    }
                } catch (error) {
                    console.error(error);
                    alert("Error al conectar con el servidor.");
                }
            });

            return; // detener submit normal
        }

        if (metodoPago === "tarjeta") {
            mostrarContador("Redirigiéndote a Stripe...");
            try {
                const idReservaTemporal = Math.floor(100000 + Math.random() * 900000);
                const response = await fetch("https://hotel-backend-3jw7.onrender.com/create-checkout-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: totalReserva * 100,
                        currency: "usd",
                        description: `Reserva para ${formData.firstName} ${formData.lastName}`,
                        metadata: { reservaId: idReservaTemporal, datosReserva: JSON.stringify(formData) }
                    }),
                });
                const result = await response.json();
                if (result.url) window.location.href = result.url;
                else alert("No se pudo iniciar el pago con tarjeta.");
            } catch (error) {
                console.error(error);
                alert("Error al procesar el pago.");
            }
        } else {
            mostrarContador("Procesando tu reserva en efectivo...");
            try {
                const response = await fetch("https://hotel-backend-3jw7.onrender.com/reserva", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                const result = await response.json();
                if (result.success) {
                    const params = new URLSearchParams(formData);
                    window.location.href = `thanks.html?${params.toString()}`;
                } else {
                    alert("Error al procesar la reserva.");
                }
            } catch (error) {
                console.error(error);
                alert("Error al conectar con el servidor.");
            }
        }
    });
}