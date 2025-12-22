import * as PDFDocument from 'pdfkit';

export function addCostosTramites(
  doc: InstanceType<typeof PDFDocument>,
  name: string,
  docNumber: string,
  nameSon: string,
) {
  doc.addPage();
  doc.x = 50; // Margen izquierdo inicial
  const TEXT_WIDTH = 495; // Ancho útil (A4 595 - 50 izq - 50 der)

  // --- TÍTULOS ---
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('COSTOS POR TRÁMITES ADMINISTRATIVOS', { align: 'center' });
  doc.moveDown(0.2);
  doc.text('Año Escolar 2026', { align: 'center' });

  doc.moveDown();
  // Forzamos X aquí también por seguridad
  doc.x = 50;
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(
      'El Padre de Familia o Apoderado o Tutor, que lee el presente documento acepta que ha tomado conocimiento y se encuentra informado sobre los siguientes costos por trámites administrativos',
      { align: 'justify', width: TEXT_WIDTH },
    );

  // --- TABLA DE COSTOS ---
  const tableData = [
    { col1: 'Tipo de documento', col2: 'Costo' },
    { col1: 'Certificado de estudios Nivel Inicial', col2: '20.00' },
    { col1: 'Certificado de estudios Nivel Primaria', col2: '20.00' },
    { col1: 'Certificado de estudios Nivel Secundaria', col2: '20.00' },
    { col1: 'Constancia de estudio', col2: '10.00' },
    { col1: 'Otras constancias', col2: '10.00' },
    { col1: 'Constancia de matrícula del SIAGIE', col2: 'sin costo' },
    { col1: 'Ficha única de matrícula (duplicado)', col2: 'sin costo' },
    { col1: 'Carnet de estudiante (duplicado)', col2: '10.00' },
    {
      col1: 'Curso de recuperación en el periodo enero - febrero',
      col2: '40.00',
    },
    { col1: 'Costo administrativo de traslado', col2: '20.00' },
  ];

  doc.moveDown();
  const startY = doc.y;
  generateCostosTable(doc, tableData, startY);

  // --- DECLARACIÓN (CORREGIDA) ---
  doc.moveDown(2);

  // *** CORRECCIÓN CRÍTICA: REINICIAR X ***
  // Esto asegura que el texto comience en el margen izquierdo y no a la derecha
  doc.x = 50;

  doc
    .font('Helvetica')
    .fontSize(10)
    .text(
      `Yo, ${name} identificado con DNI Nro. ${docNumber} en su calidad de Padre o Madre del menor(es) ${nameSon}, en señal de conformidad, consigno mi firma:`,
      { align: 'justify', width: TEXT_WIDTH },
    );

  // Fecha alineada a la derecha
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  const today = new Date();
  const day = today.getDate();
  const monthName = months[today.getMonth()];
  const year = today.getFullYear();

  doc.moveDown();
  // Forzamos X=50 para que el 'width' funcione correctamente y alinee a la derecha relativa al margen
  doc.x = 50;
  doc.text(`Huaraz, ${day} de ${monthName} del ${year}`, {
    align: 'right',
    width: TEXT_WIDTH,
  });

  // --- FIRMA ---
  doc.moveDown(4);
  const signY = doc.y;

  doc.lineWidth(0.5).strokeColor('#000');
  doc.moveTo(50, signY).lineTo(250, signY).stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('PADRE O MADRE DE FAMILIA', 50, signY + 5);
  doc.text(`NOMBRES:  ${name}`, 50, signY + 18);
  doc.text(`DNI:  ${docNumber}`, 50, signY + 31);

  // --- PIE DE PÁGINA ---
  doc.moveDown(2);
  doc.x = 50; // Reiniciar X nuevamente
  doc
    .font('Helvetica')
    .fontSize(8)
    .text(
      'Estos trámites de solicitud de documentos se realizan con la Secretaría Académica del Colegio Albert Einstein – Huaraz al correo: soporte@colegioae.freshdesk.com o en el Jr. Huaylas Nro 245, y serán entregados de acuerdo a la demanda, el orden de solicitud y la disponibilidad de la plataforma del Ministerio de Educación y del SIAGIE.',
      { align: 'justify', width: TEXT_WIDTH },
    );

  doc.moveDown(3);
  doc.x = 50;
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('LA DIRECCIÓN', { align: 'center', width: TEXT_WIDTH });
}

function generateCostosTable(doc: PDFKit.PDFDocument, data: any[], y: number) {
  const colWidths = [350, 100];
  const rowHeight = 20;

  doc.font('Helvetica-Bold').fontSize(10);
  // Header
  doc.text(data[0].col1, 55, y + 6);
  doc.text(data[0].col2, 55 + colWidths[0], y + 6, {
    align: 'center',
    width: colWidths[1],
  });
  drawRowLines(doc, y, colWidths, rowHeight);

  y += rowHeight;
  doc.font('Helvetica').fontSize(10);

  // Rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    doc.text(row.col1, 55, y + 6);
    doc.text(row.col2, 55 + colWidths[0], y + 6, {
      align: 'center',
      width: colWidths[1],
    });
    drawRowLines(doc, y, colWidths, rowHeight);
    y += rowHeight;
  }
  doc.y = y; // Update cursor Y
}

function drawRowLines(
  doc: PDFKit.PDFDocument,
  y: number,
  colWidths: number[],
  height: number,
) {
  const startX = 50;
  const endX = startX + colWidths[0] + colWidths[1];

  doc.lineWidth(0.5);
  // Linea superior
  doc.moveTo(startX, y).lineTo(endX, y).stroke();

  // Verticales
  doc
    .moveTo(startX, y)
    .lineTo(startX, y + height)
    .stroke();
  doc
    .moveTo(startX + colWidths[0], y)
    .lineTo(startX + colWidths[0], y + height)
    .stroke();
  doc
    .moveTo(endX, y)
    .lineTo(endX, y + height)
    .stroke();

  // Linea inferior
  doc
    .moveTo(startX, y + height)
    .lineTo(endX, y + height)
    .stroke();
}
