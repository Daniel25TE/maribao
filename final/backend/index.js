// index.js
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { insertarReserva, obtenerReservas, obtenerFechasOcupadasPorCuarto } from './database.js';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import { supabase } from './database.js';
import cancelarRoutes from "./routes/cancelar.js";


dotenv.config();
console.log("Node version:", process.version);
console.log("Render PORT:", process.env.PORT);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const corsOptions = {
    origin: 'https://daniel25te.github.io',  // Cambia por el URL de tu frontend
    credentials: true,  // necesario para enviar cookies en requests cross-origin
};
async function enviarCorreosReserva(datosReserva, sessionId = null) {
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

- Número de Reserva: ${datosReserva.numeroTransferencia}

Detalles de tu estadía:
- Cuarto: ${datosReserva.cuarto}
- Check-in: ${datosReserva.checkin}
- Check-out: ${datosReserva.checkout}

${datosReserva.metodoPago ? `- Método de pago: ${datosReserva.metodoPago === 'tarjeta' ? 'Tarjeta (Stripe)' :
                datosReserva.metodoPago === 'transferencia' ? 'Transferencia bancaria' :
                    'Efectivo'
                }` : ''}




Solicitudes especiales: ${datosReserva.specialRequests || 'Ninguna'}
Hora estimada de llegada: ${datosReserva.arrivalTime || 'No especificada'}
Si deseas cancelar tu reserva, ingresa tu número de reserva ${datosReserva.numeroTransferencia} en "https://daniel25te.github.io/wdd231/final/cancelar.html
"esta página y cancélala fácilmente.
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

- Número de Reserva: ${datosReserva.numeroTransferencia}

👤 Nombre del huésped: ${datosReserva.firstName} ${datosReserva.lastName}
📧 Correo: ${datosReserva.email}
📅 Check-in: ${datosReserva.checkin}
📅 Check-out: ${datosReserva.checkout}
🛏️ Cuarto reservado: ${datosReserva.cuarto}
${datosReserva.metodoPago ? `- Método de pago: ${datosReserva.metodoPago === 'tarjeta' ? 'Tarjeta (Stripe)' :
                datosReserva.metodoPago === 'transferencia' ? 'Transferencia bancaria' :
                    'Efectivo'
                }` : ''}





🔍 Ver reservas: https://hotel-backend-3jw7.onrender.com/login

—
Hotel Maribao - Notificación automática
        `,
    };

    await transporter.sendMail(mailOptionsCliente);
    await transporter.sendMail(mailOptionsEmpleador);

    console.log(`📧 Correos enviados para reserva${sessionId ? ' con sesión ' + sessionId : ''}`);
}
async function enviarCorreoClienteCancelacion(datosReserva) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const mailCliente = {
        from: process.env.EMAIL,
        to: datosReserva.email,
        subject: 'Reserva Cancelada - Hotel Maribao',
        text: `
Hola ${datosReserva.nombre || (datosReserva.firstName + ' ' + datosReserva.lastName)},

Tu reserva con número de transferencia ${datosReserva.numero_Transferencia || datosReserva.numeroTransferencia} ha sido cancelada por el administrador.

Detalles de la reserva:
- Cuarto: ${datosReserva.room_name || datosReserva.cuarto}
- Check-in: ${datosReserva.checkin_date || datosReserva.checkin}
- Check-out: ${datosReserva.checkout_date || datosReserva.checkout}

Si tienes alguna duda, contáctanos.

Hotel Maribao
        `
    };

    await transporter.sendMail(mailCliente);
    console.log(`📧 Correo de cancelación enviado al cliente ${datosReserva.email}`);
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
app.use("/cancelar", cancelarRoutes);


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


        try {
            await insertarReserva(data);
            await enviarCorreosReserva(data);

            console.log("📧 Notificación enviada al empleador:", process.env.EMAIL_EMPLEADOR);

            res.status(200).json({
                success: true,
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
app.post("/delete-reservas", async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || ids.length === 0) {
            return res.status(400).json({ error: "No se enviaron IDs para eliminar." });
        }

        // Primero obtenemos las reservas seleccionadas
        const { data: reservas, error: fetchError } = await supabase
            .from("reservas")
            .select("*")
            .in("id", ids);

        if (fetchError) throw fetchError;

        // Borrar reservas
        const { error: deleteError } = await supabase
            .from("reservas")
            .delete()
            .in("id", ids);

        if (deleteError) throw deleteError;

        // Enviar correos de cancelación solo al cliente
        for (const reserva of reservas) {
            await enviarCorreoClienteCancelacion(reserva);
        }

        res.json({ success: true, message: "Reservas eliminadas y correos enviados al cliente." });
    } catch (error) {
        console.error("Error eliminando reservas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


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
// Ruta para guardar comentarios
app.post('/api/comentario', async (req, res) => {
    const { numReserva, comentario } = req.body;

    if (!numReserva || !comentario) {
        return res.json({ ok: false, error: 'Por favor completa todos los campos.' });
    }

    try {
        // Verificar que la reserva exista
        const { data: reserva, error: errorReserva } = await supabase
            .from('reservas')
            .select('*')
            .eq('numero_Transferencia', numReserva) // coincide con tu campo en la DB
            .single();

        if (errorReserva || !reserva) {
            return res.json({ ok: false, error: 'Número de reserva no encontrado.' });
        }

        // Guardar comentario
        const { error: errorUpdate } = await supabase
            .from('reservas')
            .update({ comentario })
            .eq('numero_Transferencia', numReserva);

        if (errorUpdate) throw errorUpdate;

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.json({ ok: false, error: 'Error en el servidor.' });
    }
});

// Ruta para obtener todos los comentarios
app.get('/api/comentarios', async (req, res) => {
    try {
        const { data: comentarios, error } = await supabase
            .from('reservas')
            .select('numero_Transferencia, nombre, comentario')
            .not('comentario', 'is', null);

        if (error) throw error;

        res.json(comentarios);
    } catch (err) {
        console.error(err);
        res.json([]);
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

// GET /fechas-ocupadas - público (filtra por room)
app.get('/fechas-ocupadas', async (req, res) => {
    const roomName = req.query.roomName;
    if (!roomName) {
        return res.status(400).json({ error: 'Parámetro "roomName" es requerido' });
    }

    try {
        const fechas = await obtenerFechasOcupadasPorCuarto(roomName);
        res.json(fechas);
    } catch (error) {
        console.error('❌ Error al obtener fechas de reservas:', error.message);
        res.status(500).json({ error: 'No se pudieron obtener las fechas de reservas' });
    }
});


app.get('/', (req, res) => {
    res.send('Servidor del Hotel Maribao funcionando correctamente ✅');
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

