import express from "express";
import supabase from "../database.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

// Función para enviar correos de cancelación
async function enviarCorreoCancelacion(datosReserva, esCliente) {
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
        if (esCliente) await transporter.sendMail(mailAdmin); // solo si lo cancela el cliente
    } catch (err) {
        console.error("❌ Error enviando correos de cancelación:", err);
    }
}
// Obtener datos de la reserva (para mostrar detalles en cancelar.html)
router.get("/cliente/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;
    try {
        const { data, error } = await supabase
            .from("reservas")
            .select("*")
            .eq("numero_Transferencia", numeroTransferencia)
            .single();
        if (error || !data) return res.status(404).json({ error: "Reserva no encontrada" });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// --------------------------
// Cancelación por cliente
// --------------------------
router.put("/cliente/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;

    try {
        const { data, error: fetchError } = await supabase
            .from("reservas")
            .select("*")
            .eq("numero_Transferencia", numeroTransferencia)
            .single();

        if (fetchError || !data) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        const { error: updateError } = await supabase
            .from("reservas")
            .update({ estado: "cancelada_cliente" })
            .eq("numero_Transferencia", numeroTransferencia);

        if (updateError) {
            return res.status(500).json({ error: "Error al actualizar la reserva" });
        }

        enviarCorreoCancelacion(data, true);

        res.json({ message: "✅ Reserva cancelada por cliente. Correos enviados." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// --------------------------
// Cancelación por admin
// --------------------------
router.put("/admin/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;

    try {
        const { data, error: fetchError } = await supabase
            .from("reservas")
            .select("*")
            .eq("numero_Transferencia", numeroTransferencia)
            .single();

        if (fetchError || !data) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        const { error: updateError } = await supabase
            .from("reservas")
            .update({ estado: "cancelada_admin" })
            .eq("numero_Transferencia", numeroTransferencia);

        if (updateError) {
            return res.status(500).json({ error: "Error al actualizar la reserva" });
        }

        enviarCorreoCancelacion(data, false);

        res.json({ message: "✅ Reserva cancelada por admin. Correo enviado al cliente." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
// Eliminar reservas permanentemente
router.delete("/admin/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;

    try {
        const { error } = await supabase
            .from("reservas")
            .delete()
            .eq("numero_Transferencia", numeroTransferencia);

        if (error) return res.status(500).json({ error: "Error eliminando la reserva" });

        res.json({ message: "✅ Reserva eliminada permanentemente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


export default router;


