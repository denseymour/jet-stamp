const express = require('express');
const path = require('path');
const { customAlphabet } = require('nanoid');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Generate unique certificate ID (6 character alphanumeric)
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

// Routes

// Home page - redirect to vet interface
app.get('/', (req, res) => {
  res.redirect('/vet');
});

// Vet interface page
app.get('/vet', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vet.html'));
});

// Certificate view page
app.get('/certificate/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'certificate.html'));
});

// Verification page
app.get('/verify/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});

// API: Create new certificate
app.post('/api/certificates', async (req, res) => {
  try {
    const {
      vet_name,
      license_number,
      clinic_name,
      pet_name,
      pet_type,
      vaccine_type,
      date_administered,
      next_due_date
    } = req.body;

    // Validate required fields
    if (!vet_name || !license_number || !pet_name || !pet_type || !vaccine_type || !date_administered) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique ID
    const id = nanoid();
    const created_at = new Date().toISOString();

    // Generate QR code
    const verifyUrl = `${req.protocol}://${req.get('host')}/verify/${id}`;
    const qrCode = await QRCode.toDataURL(verifyUrl);

    // Insert into database
    const stmt = db.prepare(`
      INSERT INTO certificates (
        id, vet_name, license_number, clinic_name, pet_name,
        pet_type, vaccine_type, date_administered, next_due_date,
        created_at, qr_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, vet_name, license_number, clinic_name || null, pet_name,
      pet_type, vaccine_type, date_administered, next_due_date || null,
      created_at, qrCode
    );

    res.json({
      success: true,
      certificateId: id,
      certificateUrl: `${req.protocol}://${req.get('host')}/certificate/${id}`
    });

  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

// API: Get certificate by ID
app.get('/api/certificates/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM certificates WHERE id = ?');
    const certificate = stmt.get(id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// API: Download certificate as PDF
app.get('/api/certificates/:id/pdf', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM certificates WHERE id = ?');
    const cert = stmt.get(id);

    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=vaccination-certificate-${id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#2563eb').text('Vaccination Certificate', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#666').text('Digital Veterinary Vaccination Record', { align: 'center' });
    doc.moveDown(2);

    // Certificate ID
    doc.fontSize(10).fillColor('#999').text(`Certificate ID: ${cert.id}`, { align: 'right' });
    doc.moveDown(1);

    // Pet Information
    doc.fontSize(16).fillColor('#000').text('Pet Information');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333');
    doc.text(`Name: ${cert.pet_name}`);
    doc.text(`Type: ${cert.pet_type.charAt(0).toUpperCase() + cert.pet_type.slice(1)}`);
    doc.moveDown(1);

    // Vaccination Details
    doc.fontSize(16).fillColor('#000').text('Vaccination Details');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333');
    doc.text(`Vaccine Type: ${cert.vaccine_type}`);
    doc.text(`Date Administered: ${new Date(cert.date_administered).toLocaleDateString()}`);
    if (cert.next_due_date) {
      doc.text(`Next Due Date: ${new Date(cert.next_due_date).toLocaleDateString()}`);
    }
    doc.moveDown(1);

    // Veterinarian Information
    doc.fontSize(16).fillColor('#000').text('Veterinarian Information');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333');
    doc.text(`Name: ${cert.vet_name}`);
    doc.text(`License Number: ${cert.license_number}`);
    if (cert.clinic_name) {
      doc.text(`Clinic: ${cert.clinic_name}`);
    }
    doc.moveDown(1);

    // QR Code
    if (cert.qr_code) {
      doc.moveDown(1);
      doc.fontSize(12).fillColor('#666').text('Scan to verify:', { align: 'center' });
      doc.moveDown(0.5);
      const qrImage = Buffer.from(cert.qr_code.split(',')[1], 'base64');
      doc.image(qrImage, doc.page.width / 2 - 75, doc.y, { width: 150, align: 'center' });
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).fillColor('#999').text(
      `Issued: ${new Date(cert.created_at).toLocaleString()}`,
      { align: 'center' }
    );
    doc.text(
      `Verify at: ${req.protocol}://${req.get('host')}/verify/${cert.id}`,
      { align: 'center' }
    );

    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Jet Stamp server running on http://localhost:${PORT}`);
  console.log(`📋 Vet interface: http://localhost:${PORT}/vet`);
});
