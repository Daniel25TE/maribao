// public/js/admin.js

document.addEventListener("DOMContentLoaded", () => {
    async function cargarReservas() {
        try {
            const response = await fetch("/reservas", {
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("No autorizado o error de red");
            }
            const reservas = await response.json();

            const tbody = document.querySelector("#reservas-table");

            tbody.innerHTML = "";

            reservas.forEach((reserva) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="py-2 px-4">
                        <input type="checkbox" class="row-checkbox" value="${reserva.numero_Transferencia}">
                    </td>
                    <td>${reserva.created_at}</td>
                    <td>${reserva.nombre}</td>
                    <td>${reserva.email}</td>
                    <td>${reserva.telefono}</td>
                    <td>${reserva.checkin_date}</td>
                    <td>${reserva.checkout_date}</td>
                    <td>${reserva.room_name}</td>
                    <td>${reserva.metodo_pago}</td>
                    <td>${reserva.special_requests}</td>
                    <td>${reserva.arrival_time}</td>
                    <td>${reserva.numero_Transferencia}</td>
                    <td class="flex flex-col items-start gap-1">
                      <span>${reserva.estado}</span>
                      <div class="flex gap-2">
                        <button class="btn-cambiar-estado bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                          data-id="${reserva.id}" data-estado="${reserva.estado}" data-nuevo="pagado">
                          ${reserva.estado === 'pendiente de pago' ? 'Marcar como pagado' : 'Pagado'}
                        </button>
                        <button class="btn-cambiar-estado bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                          data-id="${reserva.id}" data-estado="${reserva.estado}" data-nuevo="pendiente de pago">
                          Marcar como pendiente
                        </button>
                      </div>
                    </td>

                    <td>
                      ${reserva.pdf_url
                        ? `<a href="${reserva.pdf_url}" target="_blank" class="text-blue-600 hover:underline">Ver PDF</a>`
                        : '<span class="text-gray-400">Sin PDF</span>'}
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

    document.addEventListener('click', async (e) => {
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
      }
    });



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
window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        window.location.reload();
    }
});

