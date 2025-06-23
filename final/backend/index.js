// index.js
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { insertarReserva, obtenerReservas } from './database.js';
import { basicAuth } from './auth.js';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));



app.use(session({
    secret: 'clave_secreta_segura',
    resave: false,
    saveUninitialized: false
}));

function protegerRuta(req, res, next) {
    if (req.session.usuarioAutenticado) {
        next();
    } else {
        res.redirect('/login');
    }
}


const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // máximo 5 peticiones por minuto
    message: 'Demasiadas solicitudes desde esta IP. Inténtalo más tarde.'
});

app.use('/login', limiter);
app.use('/reservas', limiter);
app.use('/reserva', limiter);

app.post('/reserva',
    [
        body('firstName').notEmpty().withMessage('Nombre es requerido'),
        body('lastName').notEmpty().withMessage('Apellido es requerido'),
        body('email').isEmail().withMessage('Email inválido'),
        body('checkin').notEmpty(),
        body('checkout').notEmpty(),
        body('cuarto').notEmpty()
    ],
    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        console.log("📩 Llega petición POST /reserva");
        console.log("🧾 Datos recibidos:", req.body);

        const data = req.body;
        const numeroReserva = Math.floor(100000 + Math.random() * 900000);

        try {
            await insertarReserva(data);

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

            const mailToEmployer = {
                from: process.env.EMAIL,
                to: process.env.EMAIL_EMPLEADOR,
                subject: '🔔 Nueva reserva en Hotel Maribao',
                text: `
Se ha realizado una nueva reserva en tu sitio web.

👤 Nombre del huésped: ${data.firstName} ${data.lastName}
📧 Correo: ${data.email}
📅 Check-in: ${data.checkin}
📅 Check-out: ${data.checkout}
🛏️ Cuarto reservado: ${data.cuarto}

🔍 Ver reservas: https://hotel-backend-3jw7.onrender.com/login

—
Hotel Maribao - Notificación automática
            `,
            };

            await transporter.sendMail(mailToEmployer);
            console.log("📧 Notificación enviada al empleador:", process.env.EMAIL_EMPLEADOR);

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

// Formulario de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Procesar login
app.post('/login', (req, res) => {
    const { usuario, contrasena } = req.body;

    // Usa tus credenciales reales aquí
    if (usuario === process.env.ADMIN_USER && contrasena === process.env.ADMIN_PASS) {

        req.session.usuarioAutenticado = true;
        res.redirect('/admin');
    } else {
        res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>');
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Servir panel admin protegido
app.get('/admin', protegerRuta, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// GET /reservas - protegido con login
app.get('/reservas', protegerRuta, async (req, res) => {

    console.log("📥 Petición GET /reservas recibida");
    try {
        const reservas = await obtenerReservas();
        res.status(200).json(reservas);
    } catch (error) {
        console.error('❌ Error al obtener reservas:', error.message);
        res.status(500).json({ error: 'No se pudieron obtener las reservas' });
    }
});

app.get('/', (req, res) => {
    res.send('Servidor del Hotel Maribao funcionando correctamente ✅');
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {

    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
