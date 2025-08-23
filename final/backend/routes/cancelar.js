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
async function enviarCorreoCancelacion(datosReserva, canceladoPorAdmin = false) {
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

    // Solo enviar al admin si NO fue cancelado por el admin
    if (!canceladoPorAdmin) {
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
        await transporter.sendMail(mailAdmin);
    }
}

// DELETE para clientes (frontend)
router.delete("/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;

    try {
        const { data, error: fetchError } = await supabase
            .from("reservas")
            .select("*")
            .eq("numero_Transferencia", numeroTransferencia)
            .single();

        if (fetchError || !data) return res.status(404).json({ error: "Reserva no encontrada" });

        const { error: deleteError } = await supabase
            .from("reservas")
            .delete()
            .eq("numero_Transferencia", numeroTransferencia);

        if (deleteError) return res.status(500).json({ error: "Error al eliminar la reserva" });

        await enviarCorreoCancelacion(data, false); // cancelado por cliente

        res.json({ message: "Reserva cancelada con éxito, correos enviados" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// DELETE para admin (panel)
router.delete("/admin/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;

    try {
        const { data, error: fetchError } = await supabase
            .from("reservas")
            .select("*")
            .eq("numero_Transferencia", numeroTransferencia)
            .single();

        if (fetchError || !data) return res.status(404).json({ error: "Reserva no encontrada" });

        const { error: deleteError } = await supabase
            .from("reservas")
            .delete()
            .eq("numero_Transferencia", numeroTransferencia);

        if (deleteError) return res.status(500).json({ error: "Error al eliminar la reserva" });

        await enviarCorreoCancelacion(data, true); // cancelado por admin

        res.json({ message: "Reserva cancelada por admin, correo enviado al cliente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;


