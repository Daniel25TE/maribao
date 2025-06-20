// index.js
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { insertarReserva, obtenerReservas } from './database.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/reserva', async (req, res) => {
    console.log("📩 Llega petición POST /reserva");
    console.log("🧾 Datos recibidos:", req.body);

    const data = req.body;
    const numeroReserva = Math.floor(100000 + Math.random() * 900000);

    try {
        // 👉 Guardar en Supabase
        await insertarReserva(data);

        // 👉 Enviar correo de confirmación al cliente
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: data.email, // al cliente
            subject: 'Confirmación de Reserva - Hotel Maribao',
            text: `
Hola ${data.firstName} ${data.lastName}, gracias por tu reserva.

Detalles de tu estadía:
- Cuarto: ${data.cuarto}
- Check-in: ${data.checkin}
- Check-out: ${data.checkout}
- Número de reserva: ${numeroReserva}

Solicitudes especiales: ${data.specialRequests || 'Ninguna'}
Hora estimada de llegada: ${data.arrivalTime || 'No especificada'}

¡Te esperamos!
Hotel Maribao
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Correo enviado a:", data.email);

        // 👉 Responder al frontend
        res.status(200).json({
            success: true,
            numeroReserva,
            message: 'Reserva completada con éxito',
        });

    } catch (error) {
        console.error('❌ Error al guardar o enviar:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al procesar la reserva. Intenta de nuevo.',
        });
    }
});
app.get('/reservas', async (req, res) => {
    console.log("📥 Petición GET /reservas recibida");
    try {
        const reservas = await obtenerReservas();
        res.status(200).json(reservas);
    } catch (error) {
        console.error('❌ Error al obtener reservas:', error.message);
        res.status(500).json({ error: 'No se pudieron obtener las reservas' });
    }
});


const PORT = process.env.PORT; // 👈 Importante para Render
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

