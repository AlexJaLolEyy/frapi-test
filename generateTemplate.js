const fs = require('fs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

(async () => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText('Notenliste (Vorlage)', {
    x: 50,
    y: 370,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  });

  const startY = 330;
  const rowHeight = 60;

  for (let i = 0; i < 3; i++) {
    const y = startY - i * rowHeight;

    // Name
    form.createTextField(`name_${i}`);
    const nameField = form.getTextField(`name_${i}`);
    nameField.setText('');
    nameField.addToPage(page, { x: 50, y, width: 150, height: 20 });
    page.drawText('Name:', { x: 50, y: y + 25, size: 10, font });

    // Fach
    form.createTextField(`fach_${i}`);
    const fachField = form.getTextField(`fach_${i}`);
    fachField.setText('');
    fachField.addToPage(page, { x: 220, y, width: 150, height: 20 });
    page.drawText('Fach:', { x: 220, y: y + 25, size: 10, font });

    // Datum
    form.createTextField(`datum_${i}`);
    const datumField = form.getTextField(`datum_${i}`);
    datumField.setText('');
    datumField.addToPage(page, { x: 390, y, width: 100, height: 20 });
    page.drawText('Datum:', { x: 390, y: y + 25, size: 10, font });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('notenliste.pdf', pdfBytes);

  console.log('✔️ notenliste.pdf wurde erstellt!');
})();
