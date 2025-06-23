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
          <td>${reserva.nombre}</td>
          <td>${reserva.email}</td>
          <td>${reserva.telefono}</td>
          <td>${reserva.checkin_date}</td>
          <td>${reserva.checkout_date}</td>
          <td>${reserva.room_name}</td>
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
