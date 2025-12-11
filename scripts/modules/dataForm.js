const SUPABASE_URL = "https://ceggjyfcazathwqazmtp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZ2dqeWZjYXphdGh3cWF6bXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDA2OTcsImV4cCI6MjA2NjAxNjY5N30.ZD6_6Cactwxm3Rfr0_pKpMEw_4jEzQvhFFHBwmdQJOc";


const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function dataForm() {
    let subtotalReserva = 0; // 🔥 total SIN comisión (base)

    const data = JSON.parse(localStorage.getItem("selectedRoom") || "{}");

    if (!data || Object.keys(data).length === 0) return;

    // 🔹 Ajustar precio (limpia símbolos como $, , etc.)
    data.price = Number(data.price?.toString().replace(/[^\d.]/g, '')) || 0;

    // Función para calcular comisión Stripe
function calcularComisionStripe(total) {
    const comision = total * 0.039 + 0.3; // 2.9% + 30 centavos
    const porcentaje = (comision / total) * 100;
    return { comision, porcentaje };
}

// Función para actualizar total y texto del select
function actualizarTotalConComision() {
    const totalBase = subtotalReserva; // ⭐ SIEMPRE usar total sin comisión

    const { comision, porcentaje } = calcularComisionStripe(totalBase);
    const totalFinal = totalBase + comision;

    totalPriceCopy.textContent = `$${totalFinal.toFixed(2)}`;

    totalReserva = Math.round((totalFinal + Number.EPSILON) * 100) / 100;

    // actualizar nombre de la opción tarjeta
    for (let i = 0; i < metodoPagoSelect.options.length; i++) {
        if (metodoPagoSelect.options[i].value === 'tarjeta') {
            metodoPagoSelect.options[i].text = `Tarjeta +${porcentaje.toFixed(2)}%`;
        } else {
            metodoPagoSelect.options[i].text = 'Transferencia';
        }
    }
}



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
              <select id="metodoPago" name="metodoPago" required>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
            <p><strong>Total estimado:</strong> <span id="total-price-copy">$0</span></p>


            <label>Firma <input type="text" name="fullGuestName" placeholder="Nombre completo del huésped" autocomplete="name" required></label>

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
// Cargar descuentos desde el backend y luego inicializar el calendario
let discountsMap = {}; // mapa yyyy-mm-dd -> porcentaje

fetch('https://hotel-backend-3jw7.onrender.com/api/fechas-descuento')
  .then(res => {
    if (!res.ok) throw new Error('No se pudo obtener descuentos del backend');
    return res.json();
  })
  .then(descuentos => {
    // Convertimos la lista de fechas en un mapa como el original
    descuentos.forEach(d => {
      const key = d.fecha; // tu columna nueva
      const porcentaje = parseFloat(d.porcentaje);
      discountsMap[key] = porcentaje;
    });
  })
  .catch(err => {
    console.warn('⚠️ No se pudo cargar descuentos del backend, continúa sin descuentos', err);
    discountsMap = {};
  })
  .finally(() => {
    // ahora que tenemos discountsMap (aunque esté vacío), cargamos el calendario
    cargarFechasOcupadas(data.name, discountsMap);
  });




    const metodoPagoSelect = document.getElementById("metodoPago");
    const submitBtn = document.getElementById("submitBtn");

    metodoPagoSelect.addEventListener("change", () => {
    const metodo = metodoPagoSelect.value;

    if (metodo === "transferencia") {
        totalPriceCopy.textContent = `$${subtotalReserva.toFixed(2)}`;
        totalReserva = subtotalReserva;
        return;
    }

    if (metodo === "tarjeta") {
        actualizarTotalConComision(); // ⭐ sin parámetros
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

// redondear total a 2 decimales correctamente
totalReserva = Math.round((total + Number.EPSILON) * 100) / 100;

// guardar total base (para transferencia y reseteos)
subtotalReserva = totalReserva;

// mostrar en pantalla SIEMPRE sin comisión (transferencia por defecto)
totalPriceDisplay.textContent = `$${totalReserva.toFixed(2)}`;
totalPriceCopy.textContent = `$${totalReserva.toFixed(2)}`;

// resetear método de pago a transferencia
metodoPagoSelect.value = "transferencia";
  
    } else {
        totalReserva = 0;
        totalPriceDisplay.textContent = "$0";
        totalPriceCopy.textContent = "$0";
    }
}


    checkinInput.addEventListener("change", calcularTotal);
    checkoutInput.addEventListener("change", calcularTotal);

    function mostrarContador(mensaje) {
    let modal = document.getElementById("reservation-modal");
    let paymentMessage;

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "reservation-modal";
        modal.className = "overlay-reservation-message";

        const content = document.createElement("div");
        content.className = "content-reservation-message";

        paymentMessage = document.createElement("div");
        paymentMessage.id = "payment-message";
        content.appendChild(paymentMessage);

        modal.appendChild(content);
        document.body.appendChild(modal);
    } else {
        paymentMessage = modal.querySelector("#payment-message");
    }

    let contador = 45;

    paymentMessage.innerHTML = `
        <p>${mensaje}</p>
        <p>Esto solo suele tomar unos segundos.</p>
        <p><span id="contador">${contador}</span> segundos...</p>
    `;

    const intervalo = setInterval(() => {
        contador--;
        const contadorEl = paymentMessage.querySelector("#contador");
        if (contadorEl) contadorEl.textContent = contador;

        if (contador <= 0) {
            clearInterval(intervalo);
            modal.remove();
        }
    }, 1000);
    }
    
    const form = document.getElementById("reservation-form");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const metodoPago = form.metodoPago.value;
        
      // Generamos el número de transferencia siempre
      const numeroTransferencia = Math.floor(100000 + Math.random() * 900000);
        
      // 🔹 Para transferencia necesitamos calcular antes abonoMitad y totalFormateado
      let abonoMitad = 0;
      let totalFormateado = 0;
        
      if (metodoPago === "transferencia") {
        if (document.querySelector("#transferencia-info")) return;
    
        const totalNum = Number(totalReserva) || 0;
        if (totalNum <= 0) {
          alert("Por favor selecciona fechas válidas para calcular el total antes de continuar con transferencia.");
          return;
        }
    
        // Calcular la mitad y formatear a 2 decimales
        abonoMitad = (totalNum / 2).toFixed(2);
        totalFormateado = totalNum.toFixed(2);
    
        const transferenciaInfo = document.createElement("div");
        transferenciaInfo.id = "transferencia-info";
        transferenciaInfo.innerHTML = `
          <h3 style="margin-top: 1rem; font-size: 1.3rem;">Instrucciones para la transferencia</h3>
          <p>Para hacer la reservacion por transferencia deberas de abonar la mitad del precio total o pagar el monto total.</p>
          <p><strong>Abonar mitad:</strong> $${abonoMitad}</p>
          <p><strong>Monto total:</strong> $${totalFormateado}</p>
          <p>Por favor selecciona "Siguiente", en la siguiente página te mostraremos los pasos para la transferencia.</p>
          <button id="confirmar-transferencia" type="button" style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background-color: #007bff; color: white; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer;">
            Siguiente
          </button>
        `;
        form.appendChild(transferenciaInfo);
    
        // ⚙️ Crear formData AQUÍ dentro, después de tener los valores calculados
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
          metodoPago,
          numeroTransferencia,
          total: totalReserva,
          totalFormateado,
          abonoMitad
        };
    
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
              const params = new URLSearchParams({
                ...formData,
                total: totalFormateado,
                abonoMitad,
              });
              window.location.href = `thanks.html?${params.toString()}`;
            } else {
              alert("No se pudo completar la reserva.");
            }
          } catch (error) {
            console.error(error);
            alert("Error al conectar con el servidor.");
          }
        });
    
        return; // detener el submit normal
      }
  
      // 🔹 Para los otros métodos (tarjeta / efectivo) formData normal
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
        metodoPago,
        numeroTransferencia,
        total: totalReserva
      };
  
        if (metodoPago === "tarjeta") {
            mostrarContador("Redirigiéndote a Stripe...");
            try {
                const idReservaTemporal = Math.floor(100000 + Math.random() * 900000);
                const response = await fetch("https://hotel-backend-3jw7.onrender.com/create-checkout-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: totalReserva,
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
            
            e.preventDefault(); // evita que se envíe
        alert('Por favor, selecciona un método de pago');
        return false;
        }
    });
}