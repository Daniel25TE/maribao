// index.js
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { insertarReserva, obtenerReservas } from './database.js';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Stripe from 'stripe';
import bodyParser from 'body-parser';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const corsOptions = {
    origin: 'https://daniel25te.github.io',  // Cambia por el URL de tu frontend
    credentials: true,  // necesario para enviar cookies en requests cross-origin
};
async function enviarCorreosReserva(datosReserva, numeroReserva = null, sessionId = null) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const mailOptionsCliente = {
        from: process.env.EMAIL,
        to: datosReserva.email,
        subject: 'Confirmación de Reserva - Hotel Maribao',
        text: `
Hola ${datosReserva.firstName} ${datosReserva.lastName}, gracias por tu reserva${sessionId ? ' pagada con tarjeta' : ''}.

Detalles de tu estadía:
- Cuarto: ${datosReserva.cuarto}
- Check-in: ${datosReserva.checkin}
- Check-out: ${datosReserva.checkout}
${numeroReserva ? `- Número de reserva: ${numeroReserva}` : ''}
${datosReserva.metodoPago ? `- Método de pago: ${datosReserva.metodoPago === 'tarjeta' ? 'Tarjeta (Stripe)' : 'Efectivo'}` : ''}
Solicitudes especiales: ${datosReserva.specialRequests || 'Ninguna'}
Hora estimada de llegada: ${datosReserva.arrivalTime || 'No especificada'}

¡Te esperamos!
Hotel Maribao
        `,
    };

    const mailOptionsEmpleador = {
        from: process.env.EMAIL,
        to: process.env.EMAIL_EMPLEADOR,
        subject: `🔔 Nueva reserva${sessionId ? ' pagada con tarjeta' : ''} en Hotel Maribao`,
        text: `
Se ha realizado una nueva reserva${sessionId ? ' pagada con tarjeta' : ''} en tu sitio web.

👤 Nombre del huésped: ${datosReserva.firstName} ${datosReserva.lastName}
📧 Correo: ${datosReserva.email}
📅 Check-in: ${datosReserva.checkin}
📅 Check-out: ${datosReserva.checkout}
🛏️ Cuarto reservado: ${datosReserva.cuarto}
${datosReserva.metodoPago ? `💳 Método de pago: ${datosReserva.metodoPago === 'tarjeta' ? 'Tarjeta (Stripe)' : 'Efectivo'}` : ''}
${numeroReserva ? `Número de reserva: ${numeroReserva}` : ''}

🔍 Ver reservas: https://hotel-backend-3jw7.onrender.com/login

—
Hotel Maribao - Notificación automática
        `,
    };

    await transporter.sendMail(mailOptionsCliente);
    await transporter.sendMail(mailOptionsEmpleador);

    console.log(`📧 Correos enviados para reserva${sessionId ? ' con sesión ' + sessionId : ''}`);
}

// Necesitas raw body para verificar firma
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Parsear metadata que enviaste en la sesión
        if (session.metadata && session.metadata.datosReserva) {
            const datosReserva = JSON.parse(session.metadata.datosReserva);

            try {
                // Insertar reserva en base de datos
                await insertarReserva(datosReserva);
                await enviarCorreosReserva(datosReserva, null, session.id);


                console.log(`✅ Reserva procesada y correos enviados para sesión ${session.id}`);

            } catch (error) {
                console.error('❌ Error procesando reserva desde webhook:', error);
            }
        }
    }

    res.status(200).json({ received: true });
});



app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));



app.use(session({
    secret: process.env.SESSION_SECRET || 'una_clave_muy_segura_y_larga',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,     // No accesible desde JS del navegador (protege contra XSS)
        secure: process.env.NODE_ENV === 'production',  // Solo envía cookie por HTTPS en producción
        sameSite: 'lax',    // Protege contra CSRF básico
        maxAge: 1000 * 60 * 60 * 24, // 1 día, ajusta si quieres
    }
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
    message: 'Demasiadas solicitudes desde esta IP. Inténtalo más tarde, porfavor, Gracia.'
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
        body('cuarto').notEmpty(),
        body('metodoPago').isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('Método de pago inválido'),


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
            await enviarCorreosReserva(data, numeroReserva);

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

app.post('/login',
    // Validaciones
    [
        body('usuario')
            .trim()
            .notEmpty().withMessage('El usuario es requerido'),
        body('contrasena')
            .trim()
            .notEmpty().withMessage('La contraseña es requerida')
    ],
    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).send(`
                <h1>Error en el formulario</h1>
                <ul>
                    ${errores.array().map(err => `<li>${err.msg}</li>`).join('')}
                </ul>
                <a href="/login">Volver</a>
            `);
        }

        const { usuario, contrasena } = req.body;


        try {

            if (usuario !== process.env.ADMIN_USER) {
                return res.status(401).send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>');
            }

            // Validar contraseña
            const esValido = await bcrypt.compare(contrasena, process.env.ADMIN_HASH);
            if (esValido) {
                req.session.usuarioAutenticado = true;
                res.redirect('/admin');
            } else {
                res.status(401).send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>');
            }
        } catch (error) {
            console.error('Error al verificar captcha:', error);
            res.status(500).send('Error interno. Intenta más tarde.');
        }
    }
);

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { amount, currency, description, metadata } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: currency || 'usd',
                    product_data: {
                        name: description || 'Reserva Hotel',
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            metadata,  // aquí enviamos la metadata para el webhook
            success_url: `${process.env.FRONTEND_URL}/wdd231/final/thanks.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/wdd231/final/reservar.html`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creando la sesión de pago' });
    }
});

// GET /stripe-session?session_id=...
app.get('/stripe-session', async (req, res) => {
    const { session_id } = req.query;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session && session.metadata && session.metadata.datosReserva) {
            const datosReserva = JSON.parse(session.metadata.datosReserva);
            res.json({ reserva: datosReserva });
        } else {
            res.status(404).json({ error: 'No se encontraron datos de reserva' });
        }
    } catch (error) {
        console.error("❌ Error al obtener sesión de Stripe:", error.message);
        res.status(500).json({ error: 'Error al recuperar datos de Stripe' });
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
