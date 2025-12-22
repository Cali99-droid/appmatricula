import * as PDFDocument from 'pdfkit';

export function addClausesPart1(
  doc: InstanceType<typeof PDFDocument>,
  priceEnrollment: string,
  priceAdmission: string,
  levelName: string,
  priceYear: string,
  priceMounth: string,
  // campus: string,
) {
  // --- CLÁUSULA CUARTA: CONTRAPRESTACIÓN ---
  const C4_P1A = `4.1 	El PADRE O MADRE DE FAMILIA se compromete a pagar el monto de matrícula para cada uno de los tres niveles,`;
  const C4_P1B = `ascendiente a S/ ${priceEnrollment}.00 y la cuota de ingreso (solo alumnos nuevos) es de S/ ${priceAdmission}.00.`;
  const C4_P2A = `4.2	El PADRE O MADRE DE FAMILIA conoce y acepta el monto anual del servicio educativo, el mismo que es financiado en 10 pensiones mensuales:`;

  // 4.3 (Nota: El texto original del archivo subido tiene la tabla aqui y luego puntos 4.3, 4.4, etc.)
  const C4_P3A = `4.3	El PADRE O MADRE DE FAMILIA declara haber recibido información suficiente, clara y accesible sobre la infraestructura de los locales de la ASOCIACIÓN señalados en el Anexo 1, así como sobre los criterios y características del servicio educativo que determinan el costo de las pensiones durante el año académico.`;

  const C4_P4A = `4.4	El PADRE O MADRE DE FAMILIA se compromete a pagar oportunamente las diez (10) pensiones mensuales fijas de`;
  const C4_P4B = `marzo a diciembre, respetando las siguientes fechas de vencimiento de cada pensión:`;

  const C4_P5A = `4.5	El Colegio aplicará la tasa de interés moratorio máxima legal vigente (publicada por el BCR), conforme a la normativa aplicable, sobre las pensiones mensuales vencidas, la cual se devengará a partir del día siguiente de la fecha de vencimiento establecida en el cronograma del presente contrato.`;

  const C4_P6A = `4.6	El pago realizado por concepto de cuota de ingreso otorga al alumno el derecho a acceder a una vacante, siempre que se mantenga el cumplimiento de las obligaciones académicas y económicas establecidas en el presente contrato.`;

  const C4_P7A = `4.7	El Colegio podrá variar el monto de la pensión por los Servicios únicamente cuando concurran causas objetivas, razonables y verificables, en razón de::`;
  const C4_P7B = `a) Que la tasa de inflación anual acumulada, conforme a los indicadores oficiales publicados por el organismo competente, supere el diez por ciento (10%), en cuyo caso el incremento de las pensiones se realizará de manera proporcional y razonable a dicho aumento.`;
  const C4_P7C = `b) La ocurrencia de causas objetivas, debidamente justificadas, que afecten el equilibrio económico del servicio educativo.`;
  const C4_P7D = `Cualquier variación en el monto de la pensión será debidamente comunicada al PADRE O MADRE DE FAMILIA con una anticipación no menor a treinta (30) días calendario previos a su aplicación, indicando los motivos del ajuste, sin que ello requiera la suscripción de una adenda, y otorgándole la posibilidad de resolver el contrato sin penalidad para el periodo académico siguiente, conforme a la normativa vigente.`;

  const C4_P8A = `4.8	Si bien el incumplimiento de pago no impedirá el acceso del Alumno a los servicios educativos señalados en el presente Contrato durante el periodo académico en curso, el Colegio podrá retener la entrega de certificados de estudios y constancias administrativas no indispensables para la continuidad educativa, hasta que la deuda sea totalmente cancelada.`;

  const C4_P9A = `4.9	El atraso en el pago de dos (2) pensiones o más, previa comunicación escrita al PADRE O MADRE DE FAMILIA y otorgamiento de un plazo razonable para la regularización de la deuda, podrá ocasionar la pérdida de la vacante asignada al Alumno para el año académico siguiente, sin afectar el desarrollo del periodo académico en curso ni los derechos ya adquiridos.`;

  // --- CLÁUSULA QUINTA: OBLIGACIONES COLEGIO ---
  const C5_P1A = `5.1 	Cumplir fielmente con el objeto del presente Contrato.`;
  const C5_P2A = `5.2 	Cumplir con el Plan de Estudio de acuerdo a lo señalado en el presente Contrato.`;
  const C5_P3A = `5.3 	Informar al PADRE O MADRE DE FAMILIA al final de cada bimestre, sobre los resultados del proceso educativo del alumno.`;
  const C5_P4A = `5.4	Ejecutar los Servicios en estricto respeto de la persona humana, buscando siempre el desarrollo, bienestar y cumplimiento de los objetivos trazados por los alumnos.`;
  const C5_P5A = `5.5	Cumplir con el adecuado mantenimiento y accesibilidad de la plataforma virtual;`;
  const C5_P5B = `sin embargo, de presentarse fallas en la misma, el PADRE O MADRE DE FAMILIA reconoce que, al ser servicios provistos por terceros, el Colegio no puede garantizar la total disponibilidad del mismo.`;
  const C5_P5C = `En este caso, el Colegio se obliga a recuperar la disponibilidad y accesibilidad de la plataforma virtual tan pronto sea posible, una vez detectada o comunicada la falla.`;
  const C5_P6A = `5.6	Cumplir con tener un máximo de alumnos por grupo de estudio conforme lo señalado en el numeral 6.11 del presente Contrato.`;

  // --- RENDERIZADO AL PDF ---

  // CLÁUSULA CUARTA
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA CUARTA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - CONTRAPRESTACIÓN Y FORMA DE PAGO', { underline: false });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C4_P1A} ${C4_P1B}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C4_P2A}`, { align: 'justify' });

  // doc.addPage(); // Dependiendo del espacio, puede ser necesario o no.

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('MODALIDAD PRESENCIAL O SEMIPRESENCIAL');

  const tableData = [
    {
      col1: '',
      col2: 'Costo Anual',
      col3: 'Pensión Mensual',
      col4: 'Sedes',
    },
    {
      col1: levelName.toLocaleUpperCase(),
      col2: `S/ ${priceYear}.00`,
      col3: `S/ ${priceMounth}.00`,
      col4: 'Sede 1, 2 y 3 (Ver Anexo)', // Ajustar según lógica de negocio, el doc dice "Sede 1 y 2" o "Sede 1 y 3"
    },
  ];
  let tableTop = doc.y;

  generateTable(doc, tableData, tableTop);
  tableTop += 10;

  // Texto debajo de tabla de precios
  doc
    .fontSize(7)
    .text(
      '* La relación de sedes y sus ubicaciones se detallan en el Anexo I “Locales escolares” que forma parte integrante del presente contrato.',
      50,
      doc.y + 5,
    );

  doc.moveDown();
  doc.font('Helvetica').fontSize(9).text(`${C4_P3A}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C4_P4A} ${C4_P4B}`, { align: 'justify' });

  // Tabla de Cronograma de Pagos (Fechas actualizadas al doc 2026)
  const tableData2 = [
    { col1: 'Cuota', col2: 'Vencimiento', col3: 'Cuota', col4: 'Vencimiento' },
    {
      col1: 'Marzo',
      col2: '31 de marzo',
      col3: 'Agosto',
      col4: '31 de agosto',
    },
    {
      col1: 'Abril',
      col2: '30 de abril',
      col3: 'Setiembre',
      col4: '30 de setiembre',
    },
    {
      col1: 'Mayo',
      col2: '31 de mayo',
      col3: 'Octubre',
      col4: '31 de octubre',
    },
    {
      col1: 'Junio',
      col2: '30 de junio',
      col3: 'Noviembre',
      col4: '30 de noviembre',
    },
    {
      col1: 'Julio',
      col2: '31 de julio',
      col3: 'Diciembre',
      col4: '18 de diciembre',
    }, // Fecha actualizada
  ];
  let tableTop2 = doc.y;

  generateTable2(doc, tableData2, tableTop2);
  tableTop2 += 10;

  doc.moveDown();
  // 4.5 Interés
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C4_P5A}`, 50, doc.y + 5, { align: 'justify' });
  // 4.6 Cuota Ingreso
  doc.font('Helvetica').fontSize(9).text(`${C4_P6A}`, { align: 'justify' });
  // 4.7 Variación Pensión
  doc.font('Helvetica').fontSize(9).text(`${C4_P7A}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C4_P7B}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C4_P7C}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C4_P7D}`, { align: 'justify' });
  // 4.8 Retención certificados
  doc.font('Helvetica').fontSize(9).text(`${C4_P8A}`, { align: 'justify' });
  // 4.9 Pérdida de vacante
  doc.font('Helvetica').fontSize(9).text(`${C4_P9A}`, { align: 'justify' });

  // CLAUSULA QUINTA
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA QUINTA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - OBLIGACIONES DEL COLEGIO', { underline: false });
  doc.font('Helvetica').fontSize(9).text(`${C5_P1A}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C5_P2A}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C5_P3A}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C5_P4A}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C5_P5A} ${C5_P5B} ${C5_P5C}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C5_P6A}`, { align: 'justify' });
}

export function generateTable2(
  doc: PDFKit.PDFDocument,
  data: any[],
  y: number,
) {
  const columnWidths = [110, 110, 110, 110];
  const rowHeight = 15;
  y += rowHeight;
  data.forEach((row) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col1, 65, y + 5);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col2, 165, y + 5);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col3, 275, y + 5);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col4, 385, y + 5);
    drawRowLines2(doc, y, columnWidths, rowHeight);
    y += rowHeight;
  });
}

export function generateTable(doc: PDFKit.PDFDocument, data: any[], y: number) {
  const columnWidths = [100, 100, 100, 100];
  const rowHeight = 15;
  y += rowHeight;
  data.forEach((row) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col1, 55, y + 5);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col2, 155, y + 5);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col3, 255, y + 5);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col4, 355, y + 5);
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
  doc.moveTo(50, y).lineTo(450, y).stroke();
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
    .lineTo(450, y + rowHeight)
    .stroke();
}

export function drawRowLines2(
  doc: PDFKit.PDFDocument,
  y: number,
  columnWidths: number[],
  rowHeight: number,
) {
  doc.lineWidth(0.5);
  doc.strokeColor('#000');
  doc.moveTo(50, y).lineTo(490, y).stroke();
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
    .lineTo(490, y + rowHeight)
    .stroke();
}
