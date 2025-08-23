import express from "express";
import supabase from "../database.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Configuración del transportador de correo (reutilizable de index.js)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

// Función para enviar correos de cancelación
async function enviarCorreoCancelacion(datosReserva) {
    try {
        const mailCliente = {
            from: process.env.EMAIL,
            to: datosReserva.email,
            subject: 'Reserva Cancelada - Hotel Maribao',
            text: `
Hola ${datosReserva.nombre},

Tu reserva con número de transferencia ${datosReserva.numero_Transferencia} ha sido cancelada exitosamente.

Detalles de la reserva:
- Cuarto: ${datosReserva.room_name}
- Check-in: ${datosReserva.checkin_date}
- Check-out: ${datosReserva.checkout_date}

Si tienes alguna duda, contáctanos.

Hotel Maribao
            `
        };

        const mailAdmin = {
            from: process.env.EMAIL,
            to: process.env.EMAIL_EMPLEADOR,
            subject: `Reserva Cancelada - Hotel Maribao`,
            text: `
La siguiente reserva ha sido cancelada:

- Nombre del huésped: ${datosReserva.nombre}
- Email: ${datosReserva.email}
- Número de transferencia: ${datosReserva.numero_Transferencia}
- Cuarto: ${datosReserva.room_name}
- Check-in: ${datosReserva.checkin_date}
- Check-out: ${datosReserva.checkout_date}
            `
        };

        await transporter.sendMail(mailCliente);
        await transporter.sendMail(mailAdmin);

    } catch (err) {
        console.error("❌ Error enviando correos de cancelación:", err);
        // No lanzamos error para que no rompa la respuesta JSON
    }
}

// Buscar reserva por número de transferencia
router.get("/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;

    try {
        const { data, error } = await supabase
            .from("reservas")
            .select("*")
            .eq("numero_Transferencia", numeroTransferencia)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Eliminar reserva por número de transferencia y enviar correos
router.delete("/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;

    try {
        // 1️⃣ Buscar la reserva
        const { data, error: fetchError } = await supabase
            .from("reservas")
            .select("*")
            .eq("numero_Transferencia", numeroTransferencia)
            .single();

        if (fetchError || !data) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        // 2️⃣ Eliminar la reserva
        const { error: deleteError } = await supabase
            .from("reservas")
            .delete()
            .eq("numero_Transferencia", numeroTransferencia);

        if (deleteError) {
            return res.status(500).json({ error: "Error al eliminar la reserva" });
        }

        // 3️⃣ Enviar correos (no bloquea la respuesta aunque falle)
        enviarCorreoCancelacion(data);

        // 4️⃣ Responder al frontend
        res.json({ message: "✅ Reserva cancelada correctamente. Correos enviados." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;

