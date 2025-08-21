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
        <input type="checkbox" class="row-checkbox" value="${reserva.id}">
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
        `;
                tbody.appendChild(row);
            });
        } catch (err) {
            console.error("Error al cargar reservas muchas:", err);
            alert("No se pudieron cargar las reservas");
        }
    }

    cargarReservas();
});
document.getElementById("delete-selected").addEventListener("click", async () => {
    const selected = Array.from(document.querySelectorAll(".row-checkbox:checked"))
        .map(cb => cb.value);

    if (selected.length === 0) {
        alert("No has seleccionado ninguna reserva.");
        return;
    }

    if (!confirm(`¿Seguro que deseas eliminar ${selected.length} reserva(s)?`)) {
        return;
    }

    try {
        const response = await fetch("/delete-reservas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selected })
        });

        if (response.ok) {
            alert("Reservas eliminadas correctamente.");
            window.location.reload(); // refrescamos la tabla
        } else {
            alert("Error eliminando reservas.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión con el servidor.");
    }
});

