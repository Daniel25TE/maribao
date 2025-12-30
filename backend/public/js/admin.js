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

document.getElementById("uploadVideo").addEventListener("click", async () => {
  const input = document.getElementById("videoInput");
  const status = document.getElementById("videoStatus");
  const videoPreview = document.getElementById("videoPreview"); // opcional para previsualizar

  if (!input.files.length) {
    alert("Selecciona un video");
    return;
  }

  const formData = new FormData();
  formData.append("video", input.files[0]);

  status.textContent = "Subiendo video...";

  try {
    const res = await fetch("/admin/video", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.error);

    status.textContent = `✅ Video subido correctamente`;

    loadAdminVideos();
    
    // Mostrar URL pública
    if (result.url) {
      const urlEl = document.createElement("p");
      urlEl.textContent = `URL pública: ${result.url}`;
      status.appendChild(urlEl);

      // Opcional: previsualizar video en el admin panel
      if (videoPreview) {
        videoPreview.src = result.url;
        videoPreview.load();
      }
    }

  } catch (err) {
    console.error(err);
    status.textContent = "❌ Error subiendo el video";
  }
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

async function loadAdminVideos() {
  const container = document.getElementById("videosList");
  container.innerHTML = ""; // limpiar antes de cargar

  try {
    const res = await fetch("/admin/videos", { credentials: "include" });
    const result = await res.json();

    if (!result.videos || !result.videos.length) {
      container.textContent = "No hay videos subidos aún.";
      return;
    }

    result.videos.forEach(video => {
      // Crear contenedor para cada video
      const videoDiv = document.createElement("div");
      videoDiv.style.position = "relative";
      videoDiv.style.display = "inline-block";
      videoDiv.style.margin = "10px";

      // Crear tag video
      const vid = document.createElement("video");
      vid.src = video.value;
      vid.width = 200;
      vid.controls = true;

      // Crear botón X
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "✖";
      deleteBtn.style.position = "absolute";
      deleteBtn.style.top = "0";
      deleteBtn.style.right = "0";
      deleteBtn.style.background = "red";
      deleteBtn.style.color = "white";
      deleteBtn.style.border = "none";
      deleteBtn.style.cursor = "pointer";

      // Manejar click para borrar video
      deleteBtn.addEventListener("click", () => deleteVideo(video.id, videoDiv));

      videoDiv.appendChild(vid);
      videoDiv.appendChild(deleteBtn);
      container.appendChild(videoDiv);
    });
  } catch (err) {
    console.error("Error cargando videos:", err);
    container.textContent = "Error cargando videos.";
  }
}

loadAdminVideos();

async function deleteVideo(id, videoDiv) {
  if (!confirm("¿Eliminar este video?")) return;

  try {
    const res = await fetch(`/admin/video/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);

    // Quitar del DOM
    videoDiv.remove();
  } catch (err) {
    console.error("Error eliminando video:", err);
    alert("Error eliminando video");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  async function cargarStats() {
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("No autorizado");

      const stats = await res.json();
      console.log("Datos recibidos de /api/admin/stats:", stats);

      const container = document.getElementById("stats-content");
      const visitasHoyEl = document.getElementById("visitas-hoy");

      if (!container || !visitasHoyEl) {
        console.error("No se encontraron elementos del DOM");
        return;
      }

      // Mostrar estadísticas
      container.innerHTML = `
        <h4>Por día</h4>
        ${stats.daily.map(d => `<p>${d.date}: ${d.count}</p>`).join("")}

        <h4>Por mes</h4>
        ${stats.monthly.map(m => {
          const mes = m.date ? m.date.slice(0, 7) : "—";
          return `<p>${mes}: ${m.count}</p>`;
        }).join("")}
      `;
      const totalGeneralEl = document.getElementById("total-general");

if (totalGeneralEl) {
  totalGeneralEl.innerHTML = `
    <p>
      <strong>Total visitas desde que se creó la página (12-2025):</strong>
      ${stats.total}
    </p>
  `;
}


      // Visitas de hoy
      const hoy = new Date().toISOString().split("T")[0];
      const visitasHoy = stats.daily.find(d => d.date && d.date.slice(0, 10) === hoy);
      visitasHoyEl.textContent = visitasHoy ? visitasHoy.count : 0;

      // Selector de mes
      const selector = document.getElementById("mes-selector");
      if (selector) {
        selector.addEventListener("change", () => mostrarMes(stats, selector.value));
      }

    } catch (err) {
      console.error("Error cargando stats:", err);
      const container = document.getElementById("stats-content");
      if (container) container.textContent = "No se pudieron cargar las estadísticas";
      const visitasHoyEl = document.getElementById("visitas-hoy");
      if (visitasHoyEl) visitasHoyEl.textContent = "Error";
    }
  }

  cargarStats();
});


function mostrarMes(data, mesSeleccionado) {
  const tbody = document.getElementById("visitas-semana");
  const statsMes = document.getElementById("stats-mes");
  const totalMesEl = document.getElementById("total-mes");

  statsMes.classList.remove("hidden");

  // Filtrar visitas del mes (YYYY-MM)
  const visitasMes = data.daily.filter(
    d => d.date && d.date.slice(0, 7) === mesSeleccionado
  );

  // Inicializar semanas del mes
  const semanas = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  // Contar visitas por semana del mes
  visitasMes.forEach(d => {
    const dia = Number(d.date.slice(8, 10)); // DD
    let semana;

    if (dia <= 7) semana = 1;
    else if (dia <= 14) semana = 2;
    else if (dia <= 21) semana = 3;
    else if (dia <= 28) semana = 4;
    else semana = 5;

    semanas[semana] += d.count;
  });

  // Render tabla
  tbody.innerHTML = "";
  let totalMes = 0;

  Object.entries(semanas).forEach(([semana, count]) => {
    tbody.innerHTML += `
      <tr>
        <td>Semana ${semana}</td>
        <td>${count}</td>
      </tr>
    `;
    totalMes += count;
  });

  totalMesEl.textContent = totalMes;
}


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


