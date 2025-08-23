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

// Función para enviar correo al cliente
async function enviarCorreoClienteCancelacion(datosReserva) {
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

    await transporter.sendMail(mailCliente);
}

// ----------------------------------------------------
// RUTA GET - Buscar reserva por número de transferencia (frontend)
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

// ----------------------------------------------------
// RUTA DELETE - Cancelación hecha por cliente (frontend)
// Envía correo tanto a cliente como a admin
router.delete("/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;

    try {
        // Obtener reserva antes de eliminar
        const { data, error: fetchError } = await supabase
            .from("reservas")
            .select("*")
            .eq("numero_Transferencia", numeroTransferencia)
            .single();

        if (fetchError || !data) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        // Eliminar reserva
        const { error: deleteError } = await supabase
            .from("reservas")
            .delete()
            .eq("numero_Transferencia", numeroTransferencia);

        if (deleteError) {
            return res.status(500).json({ error: "Error al eliminar la reserva" });
        }

        // Enviar correos: cliente y admin
        const mailAdmin = {
            from: process.env.EMAIL,
            to: process.env.EMAIL_EMPLEADOR,
            subject: `Reserva Cancelada - Hotel Maribao`,
            text: `
La siguiente reserva ha sido cancelada por el cliente:

- Nombre del huésped: ${data.nombre}
- Email: ${data.email}
- Número de transferencia: ${data.numero_Transferencia}
- Cuarto: ${data.room_name}
- Check-in: ${data.checkin_date}
- Check-out: ${data.checkout_date}
            `
        };

        await enviarCorreoClienteCancelacion(data);
        await transporter.sendMail(mailAdmin);

        res.json({ message: "Reserva cancelada con éxito, correos enviados" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ----------------------------------------------------
// RUTA DELETE - Cancelación hecha por administrador (panel admin)
// Envía correo solo al cliente
router.delete("/admin/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;

    try {
        // Obtener reserva antes de eliminar
        const { data, error: fetchError } = await supabase
            .from("reservas")
            .select("*")
            .eq("numero_Transferencia", numeroTransferencia)
            .single();

        if (fetchError || !data) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        // Eliminar reserva
        const { error: deleteError } = await supabase
            .from("reservas")
            .delete()
            .eq("numero_Transferencia", numeroTransferencia);

        if (deleteError) {
            return res.status(500).json({ error: "Error al eliminar la reserva" });
        }

        // Enviar correo solo al cliente
        await enviarCorreoClienteCancelacion(data);

        res.json({ message: "Reserva cancelada con éxito, correo enviado al cliente" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;


