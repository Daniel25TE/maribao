
import express from 'express';
import cors from 'cors';
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
import sgMail from "@sendgrid/mail";
import mediaRoutes from './routes/media.js';
import pdfRoutes from './routes/pdf.js';
import { generarPdfReserva, generarPdfPagado, generarPdfAbonado } from './routes/pdf.js';


dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log("Node version:", process.version);
console.log("Render PORT:", process.env.PORT);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const corsOptions = {
    origin: 'https://daniel25te.github.io',
    credentials: true,
};
async function enviarCorreosReserva(datosReserva, sessionId = null) {
    try {
        
        const pdfBuffer = await generarPdfReserva(datosReserva);

        const fileName = `reserva-${datosReserva.numeroTransferencia}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reservas-pdf')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true, // sobrescribe si existe
      });

    if (uploadError) {
      console.error('❌ Error subiendo PDF a Supabase:', uploadError);
    } else {
      console.log('✅ PDF subido a Supabase:', uploadData);
    }

    // 3️⃣ Obtener URL pública del PDF
    const { data: publicUrlData } = supabase.storage
      .from('reservas-pdf')
      .getPublicUrl(fileName);

    const pdfUrl = publicUrlData?.publicUrl || null;

    // 4️⃣ Guardar esa URL en la base de datos (junto con la reserva)
    await supabase
      .from('reservas')
      .update({ pdf_url: pdfUrl })
      .eq('numero_Transferencia', datosReserva.numeroTransferencia);

        const msgCliente = {
            to: datosReserva.email,
            from: process.env.EMAIL,
            subject: 'Confirmación de Reserva - Hotel Maribao',
            text: `
Hola ${datosReserva.firstName} ${datosReserva.lastName}, gracias por tu reserva${sessionId ? ' pagada con tarjeta' : ''}.

- Número de Reserva: ${datosReserva.numeroTransferencia}

Detalles de tu estadía:
- Cuarto: ${datosReserva.cuarto}
- Check-in: ${datosReserva.checkin}
- Check-out: ${datosReserva.checkout}

${datosReserva.metodoPago ? `- Método de pago: ${datosReserva.metodoPago === 'tarjeta' ? 'Tarjeta' :
        datosReserva.metodoPago === 'transferencia' ? 'Transferencia bancaria' :
        'Efectivo'
    }` : ''}

Solicitudes especiales: ${datosReserva.specialRequests || 'Ninguna'}
Hora estimada de llegada: ${datosReserva.arrivalTime || 'No especificada'}

Si deseas cancelar tu reserva, ingresa tu número de reserva en:
https://daniel25te.github.io/maribao/final/cancelar.html

<p>Nota: Si elegiste transferencia bancaria como método de pago, por favor realiza la transferencia correspondiente al 50% del total o al monto completo dentro de las próximas 2 horas. De no recibir el pago en ese plazo, tu reserva será cancelada automáticamente. Una vez realizada la transferencia, envíanos una captura de pantalla del comprobante a este mismo correo electrónico o por WhatsApp al +593 98 688 8256.</p>

¡Te esperamos!
Hotel Maribao
            `,
            html: `
                <p>Hola <strong>${datosReserva.firstName} ${datosReserva.lastName}</strong>, gracias por tu reserva${sessionId ? ' pagada con tarjeta' : ''}.</p>
                <p><b>Número de Reserva:</b> ${datosReserva.numeroTransferencia}</p>
                <p>
                  <b>Detalles de tu estadía:</b><br>
                  - Cuarto: ${datosReserva.cuarto}<br>
                  - Check-in: ${datosReserva.checkin}<br>
                  - Check-out: ${datosReserva.checkout}<br>
                  ${datosReserva.metodoPago ? `- Método de pago: ${datosReserva.metodoPago === 'tarjeta' ? 'Tarjeta' :
                        datosReserva.metodoPago === 'transferencia' ? 'Transferencia bancaria' :
                        'Efectivo'
                    }<br>` : ''}
                </p>
                <p>Solicitudes especiales: ${datosReserva.specialRequests || 'Ninguna'}</p>
                <p>Hora estimada de llegada: ${datosReserva.arrivalTime || 'No especificada'}</p>
                <p>Si deseas cancelar tu reserva, <a href="https://daniel25te.github.io/maribao/final/cancelar.html"><strong>haz clic aquí</strong></a>.</p>
                <p>Nota: Si elegiste transferencia bancaria como método de pago, por favor realiza la transferencia correspondiente al 50% del total o al monto completo dentro de las próximas 2 horas. De no recibir el pago en ese plazo, tu reserva será cancelada automáticamente. Una vez realizada la transferencia, envíanos una captura de pantalla del comprobante a este mismo correo electrónico o por WhatsApp al +593 98 688 8256.</p>
                <p>¡Te esperamos!<br>Hotel Maribao</p>
            `,
            attachments: [
                {
                    content: pdfBuffer.toString('base64'),
                    filename: `reserva-${datosReserva.numeroTransferencia}.pdf`,
                    type: 'application/pdf',
                    disposition: 'attachment',
                }
            ]
        };

      
        const msgEmpleador = {
            to: process.env.EMAIL_EMPLEADOR,
            from: process.env.EMAIL,
            subject: `🔔 Nueva reserva${sessionId ? ' pagada con tarjeta' : ''} en Hotel Maribao`,
            text: `
Se ha realizado una nueva reserva${sessionId ? ' pagada con tarjeta' : ''} en tu sitio web.

- Número de Reserva: ${datosReserva.numeroTransferencia}

👤 Nombre del huésped: ${datosReserva.firstName} ${datosReserva.lastName}
📧 Correo: ${datosReserva.email}
📅 Check-in: ${datosReserva.checkin}
📅 Check-out: ${datosReserva.checkout}
🛏️ Cuarto reservado: ${datosReserva.cuarto}
${datosReserva.metodoPago ? `- Método de pago: ${datosReserva.metodoPago === 'tarjeta' ? 'Tarjeta' :
        datosReserva.metodoPago === 'transferencia' ? 'Transferencia bancaria' :
        'Efectivo'
    }` : ''}

🔍 Ver reservas: https://hotel-backend-3jw7.onrender.com/login
            `,
            html: `
                <p>Se ha realizado una nueva reserva${sessionId ? ' pagada con tarjeta' : ''} en tu sitio web.</p>
                <p><b>Número de Reserva:</b> ${datosReserva.numeroTransferencia}</p>
                <p>
                  👤 Nombre del huésped: ${datosReserva.firstName} ${datosReserva.lastName}<br>
                  📧 Correo: ${datosReserva.email}<br>
                  📅 Check-in: ${datosReserva.checkin}<br>
                  📅 Check-out: ${datosReserva.checkout}<br>
                  🛏️ Cuarto reservado: ${datosReserva.cuarto}<br>
                  ${datosReserva.metodoPago ? `- Método de pago: ${datosReserva.metodoPago === 'tarjeta' ? 'Tarjeta' :
                        datosReserva.metodoPago === 'transferencia' ? 'Transferencia bancaria' :
                        'Efectivo'
                    }<br>` : ''}
                </p>
                <p>🔍 <a href="https://hotel-backend-3jw7.onrender.com/login"><strong>Ver reservas</strong></a></p>
                <p>—<br>Hotel Maribao - Notificación automática</p>
            `,
            attachments: [
                {
                    content: pdfBuffer.toString('base64'),
                    filename: `reserva-${datosReserva.numeroTransferencia}.pdf`,
                    type: 'application/pdf',
                    disposition: 'attachment',
                }
            ]
        };

        await sgMail.send(msgCliente);
        await sgMail.send(msgEmpleador);

        console.log(`📧 Correos enviados para reserva${sessionId ? ' con sesión ' + sessionId : ''}`);
    } catch (error) {
        console.error("❌ Error al enviar correos:", error.response?.body || error);
    }
}

async function enviarCorreoClienteCancelacion(datosReserva) {
    try {
        console.log("📨 Intentando enviar correo de cancelación:", datosReserva.email);
        const msgCliente = {
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
            `,
            html: `
                <p>Hola <strong>${datosReserva.nombre || (datosReserva.firstName + ' ' + datosReserva.lastName)}</strong>,</p>
                <p>Tu reserva con número de transferencia <b>${datosReserva.numero_Transferencia || datosReserva.numeroTransferencia}</b> ha sido cancelada por el administrador.</p>
                <p>
                  <b>Detalles de la reserva:</b><br>
                  - Cuarto: ${datosReserva.room_name || datosReserva.cuarto}<br>
                  - Check-in: ${datosReserva.checkin_date || datosReserva.checkin}<br>
                  - Check-out: ${datosReserva.checkout_date || datosReserva.checkout}<br>
                </p>
                <p>Si tienes alguna duda, <a href="mailto:${process.env.EMAIL}"><strong>contáctanos</strong></a>.</p>
                <p>Hotel Maribao</p>
            `
        };

        await sgMail.send(msgCliente);
        console.log(`📧 Correo de cancelación enviado al cliente ${datosReserva.email}`);
    } catch (error) {
        console.error("❌ Error al enviar correo de cancelación:", error.response?.body || error);
    }
}


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

   
        if (session.metadata && session.metadata.datosReserva) {
            const datosReserva = JSON.parse(session.metadata.datosReserva);

            try {
             
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
app.use('/api', mediaRoutes);
app.use('/api', pdfRoutes);



app.use(session({
    secret: process.env.SESSION_SECRET || 'una_clave_muy_segura_y_larga',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,   
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax', 
        maxAge: 1000 * 60 * 60 * 24,
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
    windowMs: 60 * 1000, 
    max: 5,
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


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login',

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

     
        const { data: reservas, error: fetchError } = await supabase
            .from("reservas")
            .select("*")
            .in("id", ids);

        if (fetchError) throw fetchError;

      
        const { error: deleteError } = await supabase
            .from("reservas")
            .delete()
            .in("id", ids);

        if (deleteError) throw deleteError;

      
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
            metadata, 
            success_url: `${process.env.FRONTEND_URL}/maribao/final/thanks.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/maribao/final/reservar.html`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creando la sesión de pago' });
    }
});

app.post('/api/comentario', async (req, res) => {
    const { numReserva, comentario } = req.body;

    if (!numReserva || !comentario) {
        return res.json({ ok: false, error: 'Por favor completa todos los campos.' });
    }

    try {
     
        const { data: reserva, error: errorReserva } = await supabase
            .from('reservas')
            .select('*')
            .eq('numero_Transferencia', numReserva) 
            .single();

        if (errorReserva || !reserva) {
            return res.json({ ok: false, error: 'Número de reserva no encontrado.' });
        }

       
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



app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.get('/admin', protegerRuta, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});


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

app.put('/api/reservas/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;

    // 1️⃣ Obtener la reserva actual
    const { data: reservaData, error: fetchError } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    const reserva = reservaData;

    // 2️⃣ Si se marca como “pagado”, generamos el nuevo PDF
    if (nuevoEstado === 'pagado') {
      const pdfBuffer = await generarPdfPagado(reserva);

      // Subir al mismo bucket
      const filePath = `pagado-${reserva.numero_Transferencia}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reservas-pdf')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3️⃣ Guardamos en la nueva columna pdf_reserva_pagada
      const fullUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/reservas-pdf/${filePath}`;
      await supabase
        .from('reservas')
        .update({ pdf_reserva_pagada: fullUrl })
        .eq('id', id);
    }

    // 4️⃣ Actualizar el estado en la base
    const { data, error } = await supabase
      .from('reservas')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('❌ Error al actualizar estado:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar estado' });
  }
});

// index.js  — pega este bloque cerca de los otros PUT (por ejemplo debajo de app.put('/api/reservas/:id/estado') )

app.put('/api/reservas/:id/abonado', async (req, res) => {
  try {
    const { id } = req.params;
    // opcional: si mandas monto desde front envíalo en body; si no, se tomará el que haya en la tabla
    const { montoAbonado } = req.body;

    // 1) obtener la reserva actual
    const { data: reservaData, error: fetchErr } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchErr) throw fetchErr;
    const reserva = reservaData;

    // 2) si montoAbonado fue enviado por el admin, actualizar la columna monto_abonado
    if (typeof montoAbonado !== 'undefined' && montoAbonado !== null) {
      const { error: updErr } = await supabase
        .from('reservas')
        .update({ monto_abonado: montoAbonado })
        .eq('id', id);
      if (updErr) throw updErr;
      // recarga reserva con el nuevo monto
      const { data: refreshed } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', id)
        .single();
      Object.assign(reserva, refreshed);
    }

    // 3) Generar el PDF abonado (usa la función que agregaste en routes/pdf.js)
    const pdfBuffer = await generarPdfAbonado(reserva);

    // 4) Subir al bucket (mismo bucket 'reservas-pdf'), nombre único
    const fileName = `abonado-${reserva.id}-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reservas-pdf')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });
    if (uploadError) throw uploadError;

    // 5) Obtener URL pública (igual que con los otros PDFs)
    const { data: publicUrlData } = supabase.storage
      .from('reservas-pdf')
      .getPublicUrl(fileName);
    const pdfUrl = publicUrlData?.publicUrl || null;

    // 6) Guardar la URL en la columna pdf_reserva_abonada y actualizar estado a 'abonado'
    const { error: updateErr } = await supabase
      .from('reservas')
      .update({ pdf_reserva_abonada: pdfUrl, estado: 'abonado' })
      .eq('id', id);
    if (updateErr) throw updateErr;

    res.json({ success: true, pdfUrl });
  } catch (err) {
    console.error('❌ Error en /reservas/:id/abonado', err);
    res.status(500).json({ success: false, message: 'Error creando PDF abonado' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

