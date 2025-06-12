const express = require('express');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// setup for server
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// for pdf generation
app.post('/generate', (req, res) => {
  (async () => {
    try {
      // extract data from request
      const { name_0, fach_0, datum_0, ...rest } = req.body;

      // validation for required fields
      if (!name_0 || !fach_0 || !datum_0) {
        return res.status(400).json({ 
          error: 'Bitte füllen Sie alle Felder aus' 
        });
      }

      // create new pdf document
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595, 842]); // A4 size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // add header content
      page.drawText('Notenliste', { x: 50, y: 800, size: 20, font });
      page.drawText(`Name: ${name_0}`, { x: 50, y: 760, size: 14, font });
      page.drawText(`Fach: ${fach_0}`, { x: 50, y: 730, size: 14, font });
      page.drawText(`Datum: ${datum_0}`, { x: 50, y: 700, size: 14, font });

      // create table header
      const tableTop = 650;
      const tableLeft = 50;
      const colWidth = 200;
      const rowHeight = 30;

      // fill table header
      page.drawText('Schüler', { x: tableLeft, y: tableTop, size: 12, font });
      page.drawText('Note', { x: tableLeft + colWidth, y: tableTop, size: 12, font });

      // create table lines
      page.drawLine({
        start: { x: tableLeft, y: tableTop - 5 },
        end: { x: tableLeft + colWidth * 2, y: tableTop - 5 },
        thickness: 1,
        color: rgb(0, 0, 0)
      });

      // process grades
      let currentY = tableTop - rowHeight;
      let studentCount = 0;

      // sort keys to maintain order
      const sortedKeys = Object.keys(rest).sort();
      
      for (let i = 0; i < sortedKeys.length; i += 2) {
        if (currentY < 100) { // check if we need a new page
          page = pdfDoc.addPage([595, 842]);
          currentY = 800;
          
          // add table header to new page
          page.drawText('Schüler', { x: tableLeft, y: currentY, size: 12, font });
          page.drawText('Note', { x: tableLeft + colWidth, y: currentY, size: 12, font });
          page.drawLine({
            start: { x: tableLeft, y: currentY - 5 },
            end: { x: tableLeft + colWidth * 2, y: currentY - 5 },
            thickness: 1,
            color: rgb(0, 0, 0)
          });
          currentY -= rowHeight;
        }

        const studentKey = sortedKeys[i];
        const gradeKey = sortedKeys[i + 1];
        
        if (studentKey && gradeKey) {
          const student = rest[studentKey];
          const grade = rest[gradeKey];

          // draw student name and grade
          page.drawText(student, { x: tableLeft, y: currentY, size: 12, font });
          page.drawText(grade.toString(), { x: tableLeft + colWidth, y: currentY, size: 12, font });

          // draw horizontal line
          page.drawLine({
            start: { x: tableLeft, y: currentY - 5 },
            end: { x: tableLeft + colWidth * 2, y: currentY - 5 },
            thickness: 0.5,
            color: rgb(0, 0, 0)
          });

          currentY -= rowHeight;
          studentCount++;
        }
      }

      // save pdf and response
      const pdfBytes = await pdfDoc.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=notenliste.pdf');
      res.send(pdfBytes);

    } catch (error) {
      console.error('Fehler bei der PDF-Generierung:', error);
      res.status(500).json({ 
        error: 'Ein Fehler ist bei der PDF-Generierung aufgetreten' 
      });
    }
  })();
});

// start server
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
