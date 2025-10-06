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
        doc.image(logoPng, { fit: [140, 80], align: 'center' });
      } catch (e) {
        console.warn('No se pudo incrustar logo:', e);
      }
    }

    doc.moveDown();
    doc.fontSize(18).text('Factura / Comprobante de Reserva', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(12);

    doc.text(`Nombre: ${data.nombre || 'No especificado'}`);
    doc.text(`Email: ${data.email || 'No especificado'}`);
    doc.text(`Teléfono: ${data.telefono || 'No especificado'}`);
    doc.text(`Reserva ID: ${data.reservationid || data.numero_Transferencia || 'No aplica'}`);
    doc.text(`Check-in: ${data.checkin_date || 'No especificado'}`);
    doc.text(`Check-out: ${data.checkout_date || 'No especificado'}`);
    doc.text(`Habitación: ${data.room_name || 'No especificado'}`);
    doc.text(`Solicitudes especiales: ${data.special_requests || 'Ninguna'}`);
    doc.text(`Hora de llegada: ${data.arrival_time || 'No especificada'}`);
    doc.text(`Método de pago: ${data.metodo_pago || 'No especificado'}`);
    doc.moveDown();

    const totalNum = data.total ?? 'No especificado';
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text(`Total: $${totalNum}`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica');
    doc.text('Gracias por reservar con nosotros.', { align: 'center' });
    doc.text('Maribao Hotel • contacto@maribao.example • +593 9xxxxxxx', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('Error generando PDF:', err);
    res.status(500).json({ error: 'Error generando PDF' });
  }
});

export default router;