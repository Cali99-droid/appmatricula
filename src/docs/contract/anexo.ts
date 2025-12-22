import * as PDFDocument from 'pdfkit';

export async function addAnexo(doc: InstanceType<typeof PDFDocument>) {
  const textOne = `La relación de locales escolares contemplados en el presente contrato, se identifican en el presente anexo, de acuerdo al siguiente detalle:`;

  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(9).text('ANEXO I', { align: 'center' });
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('Locales Escolares', { align: 'center' });
  doc.moveDown();
  doc.font('Helvetica').fontSize(9).text(`${textOne}`, { align: 'justify' });

  // Datos extraídos del documento WORD
  const tableData = [
    {
      col1: '', // Espacio para la imagen
      col2: 'Sede 1: Jr Huaylas Nro. 220 – Independencia\nNivel: Primaria y secundaria',
    },
    {
      col1: '',
      col2: 'Sede 1: Jr. Teresa Gonzales de Fanning Nro. 654\nNivel: Inicial',
    },
    {
      col1: '',
      col2: 'Sede 2: Jr. Augusto B. Leguia Nro. 246 - Independencia\nNivel: Inicial y primaria',
    },
    {
      col1: '',
      col2: 'Sede 3: Jr. Huaylas Nro. 245 - Independencia\nNivel: Secundaria',
    },
  ];

  generateTable(doc, tableData, doc.y);
}

export function generateTable(doc: PDFKit.PDFDocument, data: any[], y: number) {
  const columnWidths = [250, 200];
  const rowHeight = 100; // Altura para las imágenes

  y += rowHeight;

  data.forEach((row, index) => {
    // El texto de la Sede
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(row.col2, 310, y + 40);

    // Dibujamos las líneas de la fila
    drawRowLines(doc, y, columnWidths, rowHeight);
    y += rowHeight;
  });
}

export function drawRowLines(
  doc: PDFKit.PDFDocument,
  y: number,
  columnWidths: number[],
  rowHeight: number,
) {
  doc.lineWidth(0.5);
  doc.strokeColor('#000');
  doc.moveTo(50, y).lineTo(500, y).stroke();
  let xPos = 50;
  columnWidths.forEach((width) => {
    doc
      .moveTo(xPos, y)
      .lineTo(xPos, y + rowHeight)
      .stroke();
    xPos += width;
  });
  doc
    .moveTo(xPos, y)
    .lineTo(xPos, y + rowHeight)
    .stroke();
  doc
    .moveTo(50, y + rowHeight)
    .lineTo(500, y + rowHeight)
    .stroke();
}
