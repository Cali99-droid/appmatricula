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
  yearName: string, // En el documento dice 2026, usaremos la variable o hardcodeamos si es fijo
  dayClassStart: string,
  dayClassEnd: string,
) {
  // --- TEXTOS INTRODUCTORIOS ---
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

  // --- CLÁUSULA PRIMERA: ANTECEDENTES ---
  const C1_P1A = `1.1	La Asociación Educativa Luz y Ciencia es propietaria del Colegio Albert Einstein – Huaraz,`;
  const C1_P1B = `es una asociación sin fines de lucro dedicada a la gestión, ejecución y proyección de servicios educativos.`;
  const C1_P2A = `1.2	El presente Contrato se celebra en virtud de la oferta educativa brindada por la ASOCIACIÓN y la decisión de libre`;
  const C1_P2B = `voluntad del PADRE O MADRE DE FAMILIA, de contratar los servicios educativos en el modo y forma contemplados `;
  const C1_P2C = `en el presente contrato, en base a información clara, relevante y suficiente que se explican en el presente documento y`;
  const C1_P2D = `en información obrante en el portal institucional de la ASOCIACIÓN (http://www.ae.edu.pe/).`;

  // Nota: El texto original mencionaba 2026 explícitamente, aquí usamos yearName si viene como "2026"
  const C1_P3A = `1.3	La ASOCIACIÓN ha desarrollado su plan de estudio ${yearName} en concordancia con la normatividad vigente y su adecuación`;
  const C1_P3B = `a la posibilidad de una educación semipresencial requerida por las autoridades correspondientes. La elaboración del nuevo plan de estudio; así como la implementación`;
  const C1_P3C = `en las diferentes modalidades han sido llevadas a cabo mediante la asesoría de instituciones y expertos en pedagogía`;
  const C1_P3D = `de primer nivel, así como una adecuada capacitación de los docentes y personal administrativo del Colegio y será`;
  const C1_P3E = `aplicada en cumplimiento de las disposiciones legales vigentes.`;

  const C1_P4A = `1.4	La modalidad de estudio PRESENCIAL O SEMIPRESENCIAL que adopte el COLEGIO por periodo académico se realizará respetando`;
  const C1_P4B = `los lineamientos de las autoridades educativas y de salud competentes (MINEDU, DREA, UGEL, ETC y MINSA), garantizando en todo momento la continuidad del servicio educativo y el cumplimiento de los objetivos académicos.`;
  const C1_P4C = `Dicha modalidad será comunicada oportunamente al PADRE O MADRE DE FAMILIA, el cual se compromete a respetarla y cumplirla.`;

  // --- CLÁUSULA SEGUNDA: OBJETO ---
  const C2_P1A = `2.1	Por el presente Contrato La ASOCIACIÓN se obliga a prestar a favor del niño, niña o adolescente (en adelante el`;
  const C2_P1B = `“ESTUDIANTE”) sus servicios de educación en el nivel inicial, primaria, secundaria, de acuerdo con el nivel educativo del`;
  const C2_P1C = `ESTUDIANTE, en adelante los “SERVICIOS”.`;

  const C2_P2A = `2.2	La modalidad PRESENCIAL o SEMI PRESENCIAL se desarrollarán cumpliendo los protocolos de seguridad y salud`;
  const C2_P2B = `dispuestos por la autoridad competente establecida para los colegios a nivel nacional y, siempre y cuando, exista dicha disposición.`;

  const C2_P3A = `2.3	Los Servicios serán brindados de acuerdo con el plan de estudio de la ASOCIACIÓN el mismo que ha sido informado a`;
  const C2_P3B = `los Padres o Madres de Familia en su oportunidad, declarando el PADRE O MADRE DE FAMILIA haber recibido información suficiente y accesible sobre dicho plan de estudios.`;

  const C2_P4A = `2.4	El presente contrato y sus cláusulas gozan de plena autonomía respecto de contratos suscritos con fechas anteriores`;
  const C2_P4B = `de parte de la ASOCIACIÓN, sin encontrar ninguna relación de dependencia o vinculación que genere obligaciones en`;
  const C2_P4C = `las actuaciones de la ASOCIACIÓN, sin perjuicio de los derechos ya adquiridos por el ESTUDIANTE conforme a la normativa vigente.`;

  // --- CLÁUSULA TERCERA: CRONOGRAMA ---
  const C3_P1A = `3.1	El año académico se inicia el ${dayClassStart} y finaliza el ${dayClassEnd}, salvo`;
  const C3_P1B = `disposiciones del Ministerio de Educación, de la UGEL HUARAZ o autoridad competente que obligue a modificar lo establecido en el presente numeral, lo cual será oportunamente comunicado al PADRE O MADRE DE FAMILIA.`;
  const C3_P2A = `3.2	Los tres niveles educativos (inicial, primaria y secundaria) están organizados en 4 bimestres.`;
  const C3_P2B = `Al finalizar cada periodo académico los alumnos tendrán un periodo corto de descanso, conforme al cronograma académico presentado a continuación.`;

  // --- GENERACIÓN DEL PDF ---
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
    .text(`N° ${numContra}-2026-ASELUC-C`, { align: 'center' }); // Formato actualizado

  // PARRAFO 1 - INTRO
  doc.moveDown(1.5);
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(
      'Conste por el presente documento, el Contrato de Prestación de Servicios Educativos (en adelante, el “',
      { continued: true },
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

  // PARRAFO 2 - PADRE
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

  // CLAUSULA PRIMERA
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA PRIMERA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - ANTECEDENTES.', { underline: false });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C1_P1A} ${C1_P1B}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C1_P2A} ${C1_P2B} ${C1_P2C} ${C1_P2D}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C1_P3A} ${C1_P3B} ${C1_P3C} ${C1_P3D} ${C1_P3E}`, {
      align: 'justify',
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C1_P4A} ${C1_P4B} ${C1_P4C}`, { align: 'justify' });

  // CLAUSULA SEGUNDA
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA SEGUNDA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - OBJETO.', { underline: false });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C2_P1A} ${C2_P1B} ${C2_P1C}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C2_P2A} ${C2_P2B}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C2_P3A} ${C2_P3B}`, {
    align: 'justify',
  });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C2_P4A} ${C2_P4B} ${C2_P4C}`, { align: 'justify' });

  // CLAUSULA TERCERA
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA TERCERA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(
      '. - DEL CRONOGRAMA PARA LA PRESTACIÓN DE LOS SERVICIOS EDUCATIVOS.',
      { underline: false },
    );
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C3_P1A} ${C3_P1B}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C3_P2A} ${C3_P2B}`, { align: 'justify' });

  // TABLA DE CRONOGRAMA (NUEVO EN 2026)
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
  const vacationData = [
    { col1: 'Periodo Vacacional', col2: 'Inicia', col3: 'Finaliza' },
    { col1: '1er', col2: '11-may', col3: '15-may' },
    { col1: '2do', col2: '20-jul', col3: '31-jul' },
    { col1: '3er', col2: '05-oct', col3: '09-oct' },
  ];

  const yPos = doc.y;
  // Dibujamos dos tablas pequeñas una al lado de la otra o una debajo de otra
  // Usaremos la función de utilidad simple aquí para no complicar imports circulares si no hay.
  // Asumimos que podemos dibujar directo.

  generateSimpleTable(doc, cronogramaData, yPos);
  doc.moveDown(5); // Espacio después de la primera tabla
  doc.font('Helvetica-Bold').fontSize(8).text('VACACIONES', { align: 'left' });
  generateSimpleTable(doc, vacationData, doc.y);
}

function generateSimpleTable(doc: PDFKit.PDFDocument, data: any[], y: number) {
  const colWidths = [120, 80, 80];
  const rowHeight = 12;

  y += 5;

  data.forEach((row) => {
    doc
      .font('Helvetica')
      .fontSize(8)
      .text(row.col1, 55, y + 2);
    doc.text(row.col2, 55 + colWidths[0], y + 2);
    doc.text(row.col3, 55 + colWidths[0] + colWidths[1], y + 2);
    y += rowHeight;
  });
}
