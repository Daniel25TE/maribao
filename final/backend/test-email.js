import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function sendTestEmail() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL, // envía el correo a ti mismo para probar
        subject: 'Prueba de correo desde Node.js',
        text: '¡Hola! Este es un correo de prueba para verificar la configuración de nodemailer.',
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.response);
    } catch (error) {
        console.error('Error enviando correo:', error);
    }
}

sendTestEmail();
