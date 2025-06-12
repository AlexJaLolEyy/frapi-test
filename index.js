const express = require('express');
const { PDFDocument, StandardFonts } = require('pdf-lib');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json()); // JSON Body Parser

app.post('/generate', async (req, res) => {
  const { name_0, fach_0, datum_0 } = req.body;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([500, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText('Notenliste', { x: 50, y: 350, size: 20, font });
  page.drawText(`Name: ${name_0 || '-'}`, { x: 50, y: 310, size: 14, font });
  page.drawText(`Fach: ${fach_0 || '-'}`, { x: 50, y: 280, size: 14, font });
  page.drawText(`Datum: ${datum_0 || '-'}`, { x: 50, y: 250, size: 14, font });

  const pdfBytes = await pdfDoc.save();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=notenliste.pdf');
  res.send(pdfBytes);
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
