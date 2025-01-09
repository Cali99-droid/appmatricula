import * as PDFDocument from 'pdfkit';
export async function addAnexo(doc: InstanceType<typeof PDFDocument>) {
  //TEXTO DE DÉCIMO  PRIMERA
  const textOne = `La relación de locales escolares contemplados en el presente contrato, se identifican en el presente anexo, de acuerdo al siguiente detalle:`;
  // CLAUSULA DÉCIMO
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(9).text('ANEXO I', {
    align: 'center',
  });
  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(9).text('Locales Escolares', {
    align: 'center',
  });
  doc.moveDown();
  doc.font('Helvetica').fontSize(9).text(`${textOne}`, {
    align: 'justify',
  });
  const tableData = [
    {
      col1: '',
      col2: 'Local 1:  Jr Huaylas Nro. 220 – Independencia',
    },
    {
      col1: '',
      col2: 'Local 2   Jr. Augusto B. Leguía Nro. 246 - Independencia',
    },
    {
      col1: '',
      col2: 'Local 3   Jr. Huaylas Nro. 245 - Independencia',
    },
  ];

  generateTable(doc, tableData, doc.y);
}
export function generateTable(doc: PDFKit.PDFDocument, data: any[], y: number) {
  const columnWidths = [250, 200];
  const rowHeight = 100;

  y += rowHeight;

  // Dibujar filas de la tabla
  data.forEach((row, index) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(7)
      .text(row.col1, 55, y + 50);
    // doc
    //   .font('Helvetica-Bold')
    //   .fontSize(7)
    //   .text('Celular: 954 101 793', 55, y + 65);
    if (index === 0) {
      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .text(row.col2, 310, y + 50);
      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .text('Jr. Teresa Gonzales de Fanning Nro. 654', 340, y + 60);
      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .text('Celular: 908 922 752', 310, y + 70);
      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .text('Celular: 908 816 383', 310, y + 80);
      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .text('Celular: 954 101 793', 310, y + 165);
      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .text('Celular: 943 861 219', 310, y + 260);
    } else {
      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .text(row.col2, 310, y + 50);
    }
    drawRowLines(doc, y, columnWidths, rowHeight);

    y += rowHeight;
  });
}

// Dibujar las líneas de cada fila
export function // Dibujar las líneas de cada fila
drawRowLines(
  doc: PDFKit.PDFDocument,
  y: number,
  columnWidths: number[],
  rowHeight: number,
) {
  doc.lineWidth(0.5);
  doc.strokeColor('#000');

  // Dibujar la línea superior de la fila
  doc.moveTo(50, y).lineTo(500, y).stroke();

  // Dibujar las líneas verticales (columnas)
  let xPos = 50; // Posición inicial en x

  // Dibuja todas las líneas de las columnas
  columnWidths.forEach((width) => {
    // Dibuja la línea vertical de cada columna
    doc
      .moveTo(xPos, y)
      .lineTo(xPos, y + rowHeight)
      .stroke();
    xPos += width; // Avanza a la siguiente columna
  });

  // Dibuja la última línea vertical al final de la fila
  doc
    .moveTo(xPos, y)
    .lineTo(xPos, y + rowHeight)
    .stroke(); // Última línea vertical

  // Dibujar la línea inferior de la fila
  doc
    .moveTo(50, y + rowHeight)
    .lineTo(500, y + rowHeight)
    .stroke();
}
