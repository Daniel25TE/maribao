import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/generate-pdf', (req, res) => {
  try {
    const data = req.body || {};

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      const filename = `reserva-${data.reservationid || Date.now()}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    });

    const templatesDir = path.join(__dirname, '..', 'templates');
    const logoPng = path.join(templatesDir, 'maribao-logo.png');
    if (fs.existsSync(logoPng)) {
      try {
        doc.image(logoPng, { fit: [64, 70], align: 'center' });
      } catch (e) {
        console.warn('No se pudo incrustar logo:', e);
      }
    }

    doc.moveDown();

    doc.fillColor('black').fontSize(20).font('Helvetica-Bold')
       .text('Factura / Comprobante de Reserva', { align: 'center' });
    doc.moveDown(1);

    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('black').lineWidth(1).stroke();
    doc.moveDown(1);

    doc.fillColor('black').fontSize(12).font('Helvetica');
    const info = [
      ['Nombre:', data.nombre],
      ['Email:', data.email],
      ['Teléfono:', data.telefono],
      ['Reserva ID:', data.reservationid || data.numero_Transferencia || 'No aplica'],
      ['Check-in:', data.checkin_date],
      ['Check-out:', data.checkout_date],
      ['Habitación:', data.room_name],
      ['Solicitudes especiales:', data.special_requests || 'Ninguna'],
      ['Hora de llegada:', data.arrival_time || 'No especificada'],
      ['Método de pago:', data.metodo_pago || 'No especificado']
    ];

    info.forEach(([key, value]) => {
      doc.font('Helvetica-Bold').text(key, { continued: true });
      doc.font('Helvetica').text(` ${value}`);
      doc.moveDown(0.3);
    });

    doc.moveDown();

    const totalNum = data.total ?? 'No especificado';
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('black').lineWidth(1).stroke();
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('black')
       .text(`Total a pagar: $${totalNum}`, { align: 'right' });
    doc.fillColor('black');
    doc.moveDown(2);

    doc.fontSize(10).font('Helvetica').fillColor('black');
    doc.text('Gracias por reservar con nosotros.', { align: 'center' });
    doc.text('Maribao Hotel • danielalejandrosud25@gmail.com • +1 (801)-509-2879', { align: 'center' });

    doc.end();

  } catch (err) {
    console.error('Error generando PDF:', err);
    res.status(500).json({ error: 'Error generando PDF' });
  }
});

export function generarPdfReserva(datosReserva) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const templatesDir = path.join(process.cwd(), 'templates');
        const logoPng = path.join(templatesDir, 'maribao-logo.png');
        if (fs.existsSync(logoPng)) {
            doc.image(logoPng, { fit: [64, 70], align: 'center' });
        }

        doc.moveDown();
        doc.fontSize(20).text('Factura / Comprobante de Reserva', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`Nombre: ${datosReserva.firstName} ${datosReserva.lastName}`);
        doc.text(`Email: ${datosReserva.email}`);
        doc.text(`Reserva ID: ${datosReserva.numeroTransferencia}`);
        doc.text(`Cuarto: ${datosReserva.cuarto}`);
        doc.text(`Check-in: ${datosReserva.checkin}`);
        doc.text(`Check-out: ${datosReserva.checkout}`);
        doc.text(`Método de pago: ${datosReserva.metodoPago || 'No especificado'}`);
        doc.text(`Solicitudes especiales: ${datosReserva.specialRequests || 'Ninguna'}`);
        doc.text(`Hora de llegada: ${datosReserva.arrivalTime || 'No especificada'}`);

        doc.end();
    });
}

export default router;
