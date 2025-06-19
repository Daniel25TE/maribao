import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/reserva', async (req, res) => {
    console.log("Llega petición POST /reserva");
    console.log("Datos recibidos:", req.body);
    const data = req.body;
    const numeroReserva = Math.floor(100000 + Math.random() * 900000);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: data.email,
        subject: 'Confirmación de Reserva - Hotel Maribao',
        text: `
Hola ${data.firstName} ${data.lastName}, gracias por tu reserva.

Detalles:
- Cuarto: ${data.cuarto}
- Check-in: ${data.checkin}
- Check-out: ${data.checkout}
- Número de reserva: ${numeroReserva}

Solicitudes especiales: ${data.specialRequests || 'Ninguna'}

¡Te esperamos!
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, numeroReserva });
    } catch (error) {
        console.error('Error al enviar el correo:', error.message); // Aquí imprime el error completo
        console.error(error.stack);
        res.status(500).json({ success: false, message: 'Error al enviar el correo' });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
