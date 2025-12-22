import * as PDFDocument from 'pdfkit';

export function addContractHeader(
  doc: InstanceType<typeof PDFDocument>,
  numContra: string,
  name: string,
  typeDoc: string,
  docNumber: string,
  address: string,
  district: string,
  province: string,
  department: string,
  yearName: string,
  dayClassStart: string,
  dayClassEnd: string,
) {
  // Márgenes estándar para resetear posiciones
  const X_MARGIN = 50;
  const TABLE_X = 55;

  // --- TEXTOS ---
  const P1A =
    'con RUC N° 20531084587, con domicilio en Jr. Huaylas N° 220 interior 224, Distrito';
  const P1B =
    'de Independencia, Provincia de Huaraz, Departamento de Ancash, debidamente representada por el señor José Isidro Pineda';
  const P1C =
    'Sifuentes, identificado con DNI 07524459 en su calidad de DIRECTOR EJECUTIVO con poderes inscritos en la Partida';
  const P1D =
    'Electrónica N° 11064876 del Registro de Personas Jurídicas de Huaraz, a quien en lo sucesivo se le denominará la “ASOCIACIÓN”.';

  const P2A = `Y de la otra parte:`;
  const P2B = `identificado con ${typeDoc} Nro.`;
  const P2C = `con domicilio en`;
  const P2D = ' Distrito de';
  const P2E = ' Provincia de';
  const P2F = ' Departamento de';
  const P2G =
    'en su calidad de Padre o Madre o Apoderado del estudiante, a quien en lo sucesivo se le denominará indistintamente';
  const P2H = '“PADRE O MADRE DE FAMILIA”.';

  // --- CLAUSULA PRIMERA ---
  const C1_P1A = `1.1	La Asociación Educativa Luz y Ciencia es propietaria del Colegio Albert Einstein – Huaraz, es una asociación sin fines de lucro dedicada a la gestión, ejecución y proyección de servicios educativos.`;
  const C1_P2A = `1.2	El presente Contrato se celebra en virtud de la oferta educativa brindada por la ASOCIACIÓN y la decisión de libre voluntad del PADRE O MADRE DE FAMILIA, de contratar los servicios educativos en el modo y forma contemplados en el presente contrato, en base a información clara, relevante y suficiente que se explican en el presente documento y en información obrante en el portal institucional de la ASOCIACIÓN (http://www.ae.edu.pe/).`;
  const C1_P3A = `1.3	La ASOCIACIÓN ha desarrollado su plan de estudio ${yearName} en concordancia con la normatividad vigente y su adecuación a la posibilidad de una educación semipresencial requerida por las autoridades correspondientes. La elaboración del nuevo plan de estudio; así como la implementación en las diferentes modalidades han sido llevadas a cabo mediante la asesoría de instituciones y expertos en pedagogía de primer nivel, así como una adecuada capacitación de los docentes y personal administrativo del Colegio y será aplicada en cumplimiento de las disposiciones legales vigentes.`;
  const C1_P4A = `1.4	La modalidad de estudio PRESENCIAL O SEMIPRESENCIAL que adopte el COLEGIO por periodo académico se realizará respetando los lineamientos de las autoridades educativas y de salud competentes (MINEDU, DREA, UGEL, ETC y MINSA), garantizando en todo momento la continuidad del servicio educativo y el cumplimiento de los objetivos académicos. Dicha modalidad será comunicada oportunamente al PADRE O MADRE DE FAMILIA, el cual se compromete a respetarla y cumplirla.`;

  // --- CLAUSULA SEGUNDA ---
  const C2_P1A = `2.1	Por el presente Contrato La ASOCIACIÓN se obliga a prestar a favor del niño, niña o adolescente (en adelante el “ESTUDIANTE”) sus servicios de educación en el nivel inicial, primaria, secundaria, de acuerdo con el nivel educativo del ESTUDIANTE, en adelante los “SERVICIOS”.`;
  const C2_P2A = `2.2	La modalidad PRESENCIAL o SEMI PRESENCIAL se desarrollarán cumpliendo los protocolos de seguridad y salud dispuestos por la autoridad competente establecida para los colegios a nivel nacional y, siempre y cuando, exista dicha disposición.`;
  const C2_P3A = `2.3	Los Servicios serán brindados de acuerdo con el plan de estudio de la ASOCIACIÓN el mismo que ha sido informado a los Padres o Madres de Familia en su oportunidad, declarando el PADRE O MADRE DE FAMILIA haber recibido información suficiente y accesible sobre dicho plan de estudios.`;
  const C2_P4A = `2.4	El presente contrato y sus cláusulas gozan de plena autonomía respecto de contratos suscritos con fechas anteriores de parte de la ASOCIACIÓN, sin encontrar ninguna relación de dependencia o vinculación que genere obligaciones en las actuaciones de la ASOCIACIÓN, sin perjuicio de los derechos ya adquiridos por el ESTUDIANTE conforme a la normativa vigente.`;

  // --- CLAUSULA TERCERA ---
  const C3_P1A = `3.1	El año académico se inicia el ${dayClassStart} y finaliza el ${dayClassEnd}, salvo disposiciones del Ministerio de Educación, de la UGEL HUARAZ o autoridad competente que obligue a modificar lo establecido en el presente numeral, lo cual será oportunamente comunicado al PADRE O MADRE DE FAMILIA.`;
  const C3_P2A = `3.2	Los tres niveles educativos (inicial, primaria y secundaria) están organizados en 4 bimestres. Al finalizar cada periodo académico los alumnos tendrán un periodo corto de descanso, conforme al cronograma académico presentado a continuación.`;

  // --- RENDERIZADO ---
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('CONTRATO DE PRESTACIÓN DE SERVICIOS EDUCATIVOS', {
      align: 'center',
    });
  doc.moveDown(0.5);
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(`N° ${numContra}-2026-ASELUC-C`, { align: 'center' });

  // PARRAFO 1
  doc.moveDown(1.5);
  doc.x = X_MARGIN; // Asegurar margen
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(
      'Conste por el presente documento, el Contrato de Prestación de Servicios Educativos (en adelante, el “',
      { continued: true, align: 'justify' },
    );
  doc.font('Helvetica-Bold').fontSize(9).text('CONTRATO', { continued: true });
  doc.font('Helvetica').fontSize(9).text('”) que celebran de una parte: ');

  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('ASOCIACIÓN EDUCATIVA LUZ Y CIENCIA ', { continued: true });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${P1A} ${P1B} ${P1C} ${P1D}`, { align: 'justify' });

  // PARRAFO 2
  doc.moveDown();
  doc.font('Helvetica').fontSize(9).text(`${P2A} `, { continued: true });
  doc.font('Helvetica-Bold').fontSize(9).text(`${name} `, { continued: true });
  doc.font('Helvetica').fontSize(9).text(`${P2B} `, { continued: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${docNumber}, `, { continued: true });
  doc.font('Helvetica').fontSize(9).text(`${P2C} `, { continued: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${address}, `, { continued: true });
  doc.font('Helvetica').fontSize(9).text(`${P2D} `, { continued: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${district}, `, { continued: true });
  doc.font('Helvetica').fontSize(9).text(`${P2E} `, { continued: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${province}, `, { continued: true });
  doc.font('Helvetica').fontSize(9).text(`${P2F} `, { continued: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${department}, `, { continued: true });
  doc.font('Helvetica').fontSize(9).text(`${P2G} `, { continued: true });
  doc.font('Helvetica-Bold').fontSize(9).text(`${P2H}`, { align: 'justify' });

  // CLAUSULAS
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA PRIMERA. - ANTECEDENTES.', { underline: true });
  doc.font('Helvetica').fontSize(9).text(C1_P1A, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(C1_P2A, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(C1_P3A, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(C1_P4A, { align: 'justify' });

  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA SEGUNDA. - OBJETO.', { underline: true });
  doc.font('Helvetica').fontSize(9).text(C2_P1A, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(C2_P2A, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(C2_P3A, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(C2_P4A, { align: 'justify' });

  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(
      'CLÁUSULA TERCERA. - DEL CRONOGRAMA PARA LA PRESTACIÓN DE LOS SERVICIOS EDUCATIVOS.',
      { underline: true },
    );
  doc.font('Helvetica').fontSize(9).text(C3_P1A, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(C3_P2A, { align: 'justify' });

  // --- TABLAS CON LINEAS ---
  doc.moveDown(0.5);
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('ORGANIZACIÓN DE LOS BIMESTRES', { align: 'left' });

  const cronogramaData = [
    { col1: 'Bimestre', col2: 'Inicia', col3: 'Finaliza' },
    { col1: '1er Bimestre', col2: '09-mar', col3: '08-may' },
    { col1: '2do Bimestre', col2: '18-may', col3: '17-jul' },
    { col1: '3er Bimestre', col2: '03-ago', col3: '02-oct' },
    { col1: '4to Bimestre', col2: '12-oct', col3: '18-dic' },
  ];

  // Generar tabla de bimestres
  generateTableWithLines(doc, cronogramaData, doc.y, [120, 80, 80]);

  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(8).text('VACACIONES', { align: 'left' });

  const vacationData = [
    { col1: 'Periodo Vacacional', col2: 'Inicia', col3: 'Finaliza' },
    { col1: '1er', col2: '11-may', col3: '15-may' },
    { col1: '2do', col2: '20-jul', col3: '31-jul' },
    { col1: '3er', col2: '05-oct', col3: '09-oct' },
  ];

  // Generar tabla de vacaciones
  generateTableWithLines(doc, vacationData, doc.y, [120, 80, 80]);
}

// Función auxiliar local para dibujar tablas con líneas en el header
function generateTableWithLines(
  doc: PDFKit.PDFDocument,
  data: any[],
  y: number,
  colWidths: number[],
) {
  const rowHeight = 15;
  const startX = 55;

  y += 5; // Espacio inicial

  data.forEach((row) => {
    // Texto
    doc
      .font('Helvetica')
      .fontSize(9)
      .text(row.col1, startX + 5, y + 4);
    doc.text(row.col2, startX + colWidths[0] + 5, y + 4);
    doc.text(row.col3, startX + colWidths[0] + colWidths[1] + 5, y + 4);

    // Líneas
    drawHeaderRowLines(doc, y, colWidths, rowHeight, startX);
    y += rowHeight;
  });
  // Actualizar cursor del documento
  doc.y = y;
}

function drawHeaderRowLines(
  doc: PDFKit.PDFDocument,
  y: number,
  columnWidths: number[],
  rowHeight: number,
  startX: number,
) {
  doc.lineWidth(0.5);
  doc.strokeColor('#000');

  // Línea superior
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
  doc
    .moveTo(startX, y)
    .lineTo(startX + totalWidth, y)
    .stroke();

  // Columnas
  let xPos = startX;
  columnWidths.forEach((width) => {
    doc
      .moveTo(xPos, y)
      .lineTo(xPos, y + rowHeight)
      .stroke();
    xPos += width;
  });
  // Última línea vertical
  doc
    .moveTo(xPos, y)
    .lineTo(xPos, y + rowHeight)
    .stroke();

  // Línea inferior
  doc
    .moveTo(startX, y + rowHeight)
    .lineTo(startX + totalWidth, y + rowHeight)
    .stroke();
}
