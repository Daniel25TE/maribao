// public/js/admin.js

document.addEventListener("DOMContentLoaded", () => {
  async function cargarReservas() {
    try {
      const response = await fetch("/reservas", {
        credentials: "include"
      });

      if (!response.ok) throw new Error("No autorizado o error de red");
      const reservas = await response.json();

      const tbody = document.querySelector("#reservas-table");
      tbody.innerHTML = "";

      reservas.forEach((reserva) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="py-2 px-4">
            <input type="checkbox" class="row-checkbox" value="${reserva.numero_Transferencia}">
          </td>
          <td>${reserva.created_at ? new Date(reserva.created_at).toLocaleString("es-ES", {
            dateStyle: "medium",
            timeStyle: "short"
          }) : ''}</td>
          <td>${reserva.nombre || ''}</td>
          <td>${reserva.email || ''}</td>
          <td>${reserva.telefono || ''}</td>
          <td>${reserva.checkin_date || ''}</td>
          <td>${reserva.checkout_date || ''}</td>
          <td>${reserva.room_name || ''}</td>
          <td>${reserva.metodo_pago || ''}</td>
          <td>${reserva.special_requests || ''}</td>
          <td>${reserva.arrival_time || ''}</td>
          <td>${reserva.numero_Transferencia || ''}</td>
          <td class="flex flex-col items-start gap-1">
            <span>${reserva.estado || ''}</span>
            <div class="flex gap-2">
              <button class="btn-cambiar-estado bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                data-id="${reserva.id}" data-estado="${reserva.estado}" data-nuevo="pendiente de pago">
                Marcar como pendiente
              </button>
              <button class="btn-abonado bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                data-id="${reserva.id}" data-estado="${reserva.estado}">
                Marcar como abonado
              </button>
              <button class="btn-cambiar-estado bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                data-id="${reserva.id}" data-estado="${reserva.estado}" data-nuevo="pagado">
                ${reserva.estado === 'pendiente de pago' ? 'Marcar como pagado' : 'Pagado'}
              </button>
            </div>
          </td>

          <td>
            ${reserva.pdf_url
              ? `<a href="${reserva.pdf_url}" target="_blank" class="text-blue-600 hover:underline">Ver PDF</a>`
              : '<span class="text-gray-400">Sin PDF</span>'}
          </td>
          <td>
            ${reserva.pdf_reserva_abonada
              ? `<a href="${reserva.pdf_reserva_abonada}" target="_blank" class="text-indigo-600 hover:underline">Ver PDF Abonado</a>`
              : '<span class="text-gray-400">Sin PDF Abonado</span>'}
          </td>
          <td>
            ${reserva.pdf_reserva_pagada
              ? `<a href="${reserva.pdf_reserva_pagada}" target="_blank" class="text-green-600 hover:underline">Ver PDF Pagado</a>`
              : '<span class="text-gray-400">Sin PDF Pagado</span>'}
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error("Error al cargar reservas:", err);
      alert("No se pudieron cargar las reservas");
    }
  }

  cargarReservas();

  // Delegación de eventos: un solo listener para los botones
  document.addEventListener('click', async (e) => {
    // -------- cambiar estado (pagado / pendiente) ----------
    if (e.target.classList.contains('btn-cambiar-estado')) {
      const id = e.target.dataset.id;
      const nuevoEstado = e.target.dataset.nuevo;

      const confirmar = confirm(`¿Marcar esta reserva como ${nuevoEstado.toUpperCase()}?`);
      if (!confirmar) return;

      try {
        const response = await fetch(`/api/reservas/${id}/estado`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nuevoEstado })
        });

        const result = await response.json();
        if (result.success) {
          alert(`✅ Estado actualizado a ${nuevoEstado.toUpperCase()}`);
          location.reload();
        } else {
          alert('❌ No se pudo actualizar el estado');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al conectar con el servidor');
      }
      return; // importante para no seguir ejecutando
    }

    // -------- marcar como abonado ----------
    if (e.target.classList.contains('btn-abonado')) {
      const id = e.target.dataset.id;

      // Prompt simple y rápido (si quieres luego lo convertimos a modal)
      const montoStr = prompt('Ingrese el monto abonado (solo números, ej. 50.00):');
      if (montoStr === null) return; // canceló
      const monto = parseFloat(montoStr.replace(',', '.'));
      if (isNaN(monto) || monto < 0) {
        alert('Monto inválido. Intenta nuevamente.');
        return;
      }

      if (!confirm(`Confirmar: marcar como "abonado" y guardar monto abonado $${monto.toFixed(2)} ?`)) return;

      try {
        const response = await fetch(`/api/reservas/${id}/abonado`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ montoAbonado: monto })
        });

        const result = await response.json();
        if (result.success) {
          alert('✅ Reserva marcada como ABONADO y PDF generado.');
          location.reload();
        } else {
          console.error('Respuesta error:', result);
          alert('❌ No se pudo marcar como abonado');
        }
      } catch (err) {
        console.error('Error marcando abonado:', err);
        alert('❌ Error al conectar con el servidor');
      }
      return;
    }

    // notar: otros click handlers (por ejemplo, filas) pueden ir aquí si los necesitas
  });

  // ------------ botones eliminar (ya existentes) -------------
  document.getElementById("delete-selected").addEventListener("click", async () => {
    const selected = Array.from(document.querySelectorAll(".row-checkbox:checked"))
      .map(cb => cb.value);

    if (selected.length === 0) {
      alert("No has seleccionado ninguna reserva.");
      return;
    }

    if (!confirm(`¿Seguro que deseas cancelar ${selected.length} reserva(s)?`)) {
      return;
    }

    try {
      for (const numero of selected) {
        await fetch(`/cancelar/admin/${numero}`, { method: "PUT" });
      }
      alert("Reservas canceladas correctamente.");
      window.location.reload(); // refrescamos la tabla
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servidor.");
    }
  });

  document.getElementById("delete-permanent").addEventListener("click", async () => {
    const selected = Array.from(document.querySelectorAll(".row-checkbox:checked"))
      .map(cb => cb.value);

    if (selected.length === 0) {
      alert("No has seleccionado ninguna reserva.");
      return;
    }

    if (!confirm(`¿Seguro que deseas eliminar permanentemente ${selected.length} reserva(s)?`)) {
      return;
    }

    try {
      for (const numero of selected) {
        await fetch(`/cancelar/admin/${numero}`, { method: "DELETE" });
      }
      alert("Reservas eliminadas permanentemente.");
      window.location.reload(); // refrescamos la tabla
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servidor.");
    }
  });

});

async function cargarFechasDescuento() {
  try {
    const response = await fetch("/api/admin/fechas-descuento", { credentials: "include" });
    if (!response.ok) throw new Error("No autorizado o error de red");
    const descuentos = await response.json();

    const tbody = document.querySelector("#fechas-descuento-table");
    tbody.innerHTML = "";

    descuentos.forEach(d => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="py-2 px-4 border border-gray-300">${d.fecha}</td>
        <td class="py-2 px-4 border border-gray-300">${d.porcentaje}%</td>
        <td class="py-2 px-4 border border-gray-300">${d.descripcion || ''}</td>
        <td class="py-2 px-4 border border-gray-300">${d.activo ? 'Sí' : 'No'}</td>
        <td class="py-2 px-4 border border-gray-300 flex gap-2">
            <button class="edit-discount bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm" data-id="${d.id}">✏️ Editar</button>
            <button class="delete-discount bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm" data-id="${d.id}">🗑️ Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Error cargando fechas de descuento:", err);
    alert("No se pudieron cargar las fechas de descuento");
  }
}

// Ejecutar al cargar la página
cargarFechasDescuento();

document.addEventListener("click", async (e) => {
  // Eliminar
  if (e.target.classList.contains("delete-discount")) {
    const id = e.target.dataset.id;
    if (!confirm("¿Eliminar esta fecha de descuento?")) return;

    try {
      const res = await fetch(`/api/admin/fechas-descuento/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        alert("✅ Fecha eliminada");
        cargarFechasDescuento();
      }
    } catch (err) {
      console.error(err);
      alert("Error eliminando la fecha");
    }
  }

  // Editar (puedes abrir un prompt simple o modal)
  if (e.target.classList.contains("edit-discount")) {
    const id = e.target.dataset.id;
    const fecha = prompt("Nueva fecha (YYYY-MM-DD):");
    const porcentaje = prompt("Nuevo porcentaje:");
    const descripcion = prompt("Descripción:");
    const activo = confirm("¿Activo? OK = Sí, Cancelar = No");

    if (!fecha || !porcentaje) return;

    try {
      const res = await fetch(`/api/admin/fechas-descuento/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha, porcentaje, descripcion, activo })
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Fecha actualizada");
        cargarFechasDescuento();
      }
    } catch (err) {
      console.error(err);
      alert("Error actualizando la fecha");
    }
  }
});

// Agregar nueva fecha
document.getElementById("add-discount").addEventListener("click", async () => {
  const fecha = prompt("Fecha (YYYY-MM-DD):");
  const porcentaje = prompt("Porcentaje:");
  const descripcion = prompt("Descripción (opcional):");

  if (!fecha || !porcentaje) return;

  try {
    const res = await fetch("/api/admin/fechas-descuento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha, porcentaje, descripcion, activo: true })
    });
    const result = await res.json();
    if (result.success) {
      alert("✅ Fecha agregada");
      cargarFechasDescuento();
    }
  } catch (err) {
    console.error(err);
    alert("Error agregando fecha");
  }
});


window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});


