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

    const leftX = doc.x;
    doc.fontSize(11);
    doc.text(`Nombre: ${data.nombre || data.firstName || ''}`);
    doc.text(`Email: ${data.email || ''}`);
    doc.text(`Teléfono: ${data.phone || ''}`);
    doc.text(`Reserva ID: ${data.reservationid || data.numeroTransferencia || ''}`);
    doc.moveDown(0.5);
    doc.text(`Check-in: ${data.checkin_date || data.checkIn || ''}`);
    doc.text(`Check-out: ${data.checkout_date || data.checkOut || ''}`);
    doc.text(`Método de pago: ${data.metodo_pago || data.metodoPago || ''}`);
    doc.moveDown();

    const habitaciones = data.habitaciones || data.rooms || [];
    if (Array.isArray(habitaciones) && habitaciones.length) {
      doc.font('Helvetica-Bold');
      const tableTop = doc.y;
      doc.text('Habitación', leftX, tableTop);
      doc.text('Precio', 350, tableTop, { width: 90, align: 'right' });
      doc.text('Noches', 460, tableTop, { width: 60, align: 'right' });
      doc.moveDown(0.5);
      doc.font('Helvetica');

      habitaciones.forEach((h) => {
        const y = doc.y;
        doc.text(h.tipo || h.name || '-', leftX, y);
        const price = (h.precio ?? h.price ?? 0);
        doc.text(`$${Number(price).toFixed(2)}`, 350, y, { width: 90, align: 'right' });
        doc.text(String(h.noches ?? h.nights ?? ''), 460, y, { width: 60, align: 'right' });
        doc.moveDown(0.5);
      });
    }

    doc.moveDown(1);
    doc.fontSize(13).font('Helvetica-Bold');
    const totalNum = data.total ?? data.totalAmount ?? 0;
    doc.text(`Total: $${Number(totalNum).toFixed(2)}`, { align: 'right' });

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

