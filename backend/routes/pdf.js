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
       .text('Comprobante de Abono de Reserva', { align: 'center' });
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

    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica').fillColor('black')
    .text('Política de cancelación: no reembolsable. Si tienes alguna duda sobre tu abono, por favor comunícate con nosotros a nuestro número de WhatsApp o correo electrónico.', {
      align: 'center'
    });
    doc.moveDown(2);

    doc.fontSize(10).font('Helvetica').fillColor('black');
    doc.text('Gracias por reservar con nosotros.', { align: 'center' });
    doc.text('Maribao • administrador@maribao.com • +593 98-688-8256', { align: 'center' });

    doc.end();

  } catch (err) {
    console.error('Error generando PDF:', err);
    res.status(500).json({ error: 'Error generando PDF' });
  }
});

export function generarPdfReserva(datosReserva) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // === LOGO ===
      const templatesDir = path.join(process.cwd(), 'templates');
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
         .text('Comprobante de Abono de Reserva', { align: 'center' });
      doc.moveDown(1);

      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('black').lineWidth(1).stroke();
      doc.moveDown(1);

      // === INFORMACIÓN PRINCIPAL ===
      doc.fillColor('black').fontSize(12).font('Helvetica');

      const info = [
        ['Nombre:', `${datosReserva.firstName} ${datosReserva.lastName}`],
        ['Email:', datosReserva.email],
        ['Reserva ID:', datosReserva.numeroTransferencia],
        ['Cuarto:', datosReserva.cuarto],
        ['Check-in:', datosReserva.checkin],
        ['Check-out:', datosReserva.checkout],
        ['Método de pago:', datosReserva.metodoPago || 'No especificado'],
        ['Solicitudes especiales:', datosReserva.specialRequests || 'Ninguna'],
        ['Hora de llegada:', datosReserva.arrivalTime || 'No especificada']
      ];

      info.forEach(([key, value]) => {
        doc.font('Helvetica-Bold').text(key, { continued: true });
        doc.font('Helvetica').text(` ${value}`);
        doc.moveDown(0.3);
      });

      doc.moveDown();

      // === TOTAL ===
      const totalNum = datosReserva.total ?? 'No especificado';
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('black').lineWidth(1).stroke();
      doc.moveDown(0.5);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('black')
         .text(`Total a pagar: $${totalNum}`, { align: 'right' });

      doc.moveDown(2);

      // === PIE DE PÁGINA ===
      doc.fontSize(10).font('Helvetica').fillColor('black');
      doc.text('Gracias por reservar con nosotros.', { align: 'center' });
      doc.text('Maribao Hotel • danielalejandrosud25@gmail.com • +1 (801)-509-2879', { align: 'center' });

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}

export function generarPdfPagado(datosReserva) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // === LOGO ===
      const templatesDir = path.join(process.cwd(), 'templates');
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
         .text('Comprobante de Reserva - PAGADO', { align: 'center' });
      doc.moveDown(1);

      doc.moveTo(40, doc.y).lineTo(555, doc.y)
         .strokeColor('black').lineWidth(1).stroke();
      doc.moveDown(1);

      // === INFORMACIÓN PRINCIPAL ===
      doc.fillColor('black').fontSize(12).font('Helvetica');

      const info = [
        ['Nombre:', `${datosReserva.firstName || datosReserva.nombre || ''} ${datosReserva.lastName || datosReserva.apellido || ''}`],
        ['Email:', datosReserva.email || 'No especificado'],
        ['Reserva ID:', datosReserva.numeroTransferencia || datosReserva.numero_Transferencia || 'No aplica'],
        ['Cuarto:', datosReserva.cuarto || datosReserva.room_name || 'No especificado'],
        ['Check-in:', datosReserva.checkin || datosReserva.checkin_date || 'No especificado'],
        ['Check-out:', datosReserva.checkout || datosReserva.checkout_date || 'No especificado'],
        ['Método de pago:', datosReserva.metodoPago || datosReserva.metodo_pago || 'No especificado'],
        ['Solicitudes especiales:', datosReserva.specialRequests || datosReserva.special_requests || 'Ninguna'],
        ['Hora de llegada:', datosReserva.arrivalTime || datosReserva.arrival_time || 'No especificada']
      ];

      info.forEach(([key, value]) => {
        doc.font('Helvetica-Bold').text(key, { continued: true });
        doc.font('Helvetica').text(` ${value}`);
        doc.moveDown(0.3);
      });

      doc.moveDown();

      // === TOTAL ===
      const totalNum = datosReserva.total ?? datosReserva.total_reserva ?? 'No especificado';
      doc.moveTo(40, doc.y).lineTo(555, doc.y)
         .strokeColor('black').lineWidth(1).stroke();
      doc.moveDown(0.5);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('black')
         .text(`PAGADO: $${totalNum}`, { align: 'right' });

      doc.moveDown(2);

      // === PIE DE PÁGINA ===
      doc.fontSize(10).font('Helvetica').fillColor('black');
      doc.text('Gracias por reservar con nosotros.', { align: 'center' });
      doc.text('Maribao Hotel • danielalejandrosud25@gmail.com • +1 (801)-509-2879', { align: 'center' });

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}

// routes/pdf.js  (agregar AL FINAL, debajo de generarPdfPagado)

export function generarPdfAbonado(datosReserva) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // === LOGO ===
      const templatesDir = path.join(process.cwd(), 'templates');
      const logoPng = path.join(templatesDir, 'maribao-logo.png');
      if (fs.existsSync(logoPng)) {
        try { doc.image(logoPng, { fit: [64, 70], align: 'center' }); }
        catch (e) { console.warn('No se pudo incrustar logo:', e); }
      }

      doc.moveDown();
      doc.fillColor('black').fontSize(20).font('Helvetica-Bold')
         .text('Comprobante de Pago Parcial de Reserva - ABONADO', { align: 'center' });
      doc.moveDown(1);

      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('black').lineWidth(1).stroke();
      doc.moveDown(1);

      // === INFORMACIÓN PRINCIPAL ===
      doc.fillColor('black').fontSize(12).font('Helvetica');

      // Soporta ambos formatos (frontend/back-end) como hicimos antes
      const nombre = `${datosReserva.firstName || datosReserva.nombre || ''} ${datosReserva.lastName || datosReserva.apellido || ''}`.trim();
      const email = datosReserva.email || '';
      const reservaId = datosReserva.numeroTransferencia || datosReserva.numero_transferencia || datosReserva.reservationid || '';
      const cuarto = datosReserva.cuarto || datosReserva.room_name || '';
      const checkin = datosReserva.checkin || datosReserva.checkin_date || '';
      const checkout = datosReserva.checkout || datosReserva.checkout_date || '';
      const metodo = datosReserva.metodoPago || datosReserva.metodo_pago || '';
      const special = datosReserva.specialRequests || datosReserva.special_requests || 'Ninguna';
      const arrival = datosReserva.arrivalTime || datosReserva.arrival_time || '';

      const total = Number(datosReserva.total ?? datosReserva.total_reserva ?? 0);
      const montoAbonado = Number(datosReserva.monto_abonado ?? datosReserva.montoAbonado ?? 0);
      const montoAPagar = (total - montoAbonado);

      const info = [
        ['Nombre:', nombre || 'No especificado'],
        ['Email:', email || 'No especificado'],
        ['Reserva ID:', reservaId || 'No aplica'],
        ['Cuarto:', cuarto || 'No especificado'],
        ['Check-in:', checkin || 'No especificado'],
        ['Check-out:', checkout || 'No especificado'],
        ['Método de pago:', metodo || 'No especificado'],
        ['Solicitudes especiales:', special],
        ['Hora de llegada:', arrival || 'No especificada']
      ];

      info.forEach(([key, value]) => {
        doc.font('Helvetica-Bold').text(key, { continued: true });
        doc.font('Helvetica').text(` ${value}`);
        doc.moveDown(0.3);
      });

      doc.moveDown();

      // === MONTOS ===
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('black').lineWidth(1).stroke();
      doc.moveDown(0.5);

      doc.fontSize(14).font('Helvetica-Bold').text(`Monto abonado: $${montoAbonado.toFixed(2)}`, { align: 'right' });
      doc.moveDown(0.3);
      doc.fontSize(14).font('Helvetica-Bold').text(`Monto a pagar: $${montoAPagar.toFixed(2)}`, { align: 'right' });
      doc.moveDown(0.3);
      doc.fontSize(16).font('Helvetica-Bold').text(`Precio total: $${total.toFixed(2)}`, { align: 'right' });

      doc.moveDown(2);

      // === PIE DE PÁGINA ===
      doc.fontSize(10).font('Helvetica').fillColor('black');
      doc.text('Gracias por reservar con nosotros.', { align: 'center' });
      doc.text('Maribao Hotel • danielalejandrosud25@gmail.com • +1 (801)-509-2879', { align: 'center' });

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}


export default router;
