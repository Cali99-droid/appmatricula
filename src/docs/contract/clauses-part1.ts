import * as PDFDocument from 'pdfkit';

export function addClausesPart1(
  doc: InstanceType<typeof PDFDocument>,
  priceEnrollment: string,
  priceAdmission: string,
  levelName: string,
  priceYear: string,
  priceMounth: string,
  campus: string,
) {
  // Configuración inicial de márgenes y ancho de texto
  doc.x = 50;
  const TEXT_WIDTH = 495; // A4 (595) - Margen Izq (50) - Margen Der (50) = 495

  // --- CLÁUSULA CUARTA: TEXTOS ---
  const C4_P1A = `4.1 	El PADRE O MADRE DE FAMILIA se compromete a pagar el monto de matrícula para cada uno de los tres niveles, ascendiente a S/ ${priceEnrollment}.00 y la cuota de ingreso (solo alumnos nuevos) es de S/ ${priceAdmission}.00.`;
  const C4_P2A = `4.2	El PADRE O MADRE DE FAMILIA conoce y acepta el monto anual del servicio educativo, el mismo que es financiado en 10 pensiones mensuales:`;
  const C4_P3A = `4.3	El PADRE O MADRE DE FAMILIA declara haber recibido información suficiente, clara y accesible sobre la infraestructura de los locales de la ASOCIACIÓN señalados en el Anexo 1, así como sobre los criterios y características del servicio educativo que determinan el costo de las pensiones durante el año académico.`;
  const C4_P4A = `4.4	El PADRE O MADRE DE FAMILIA se compromete a pagar oportunamente las diez (10) pensiones mensuales fijas de marzo a diciembre, respetando las siguientes fechas de vencimiento de cada pensión:`;

  const C4_P5A = `4.5	El Colegio aplicará la tasa de interés moratorio máxima legal vigente (publicada por el BCR), conforme a la normativa aplicable, sobre las pensiones mensuales vencidas, la cual se devengará a partir del día siguiente de la fecha de vencimiento establecida en el cronograma del presente contrato.`;
  const C4_P6A = `4.6	El pago realizado por concepto de cuota de ingreso otorga al alumno el derecho a acceder a una vacante, siempre que se mantenga el cumplimiento de las obligaciones académicas y económicas establecidas en el presente contrato.`;

  const C4_P7A = `4.7	El Colegio podrá variar el monto de la pensión por los Servicios únicamente cuando concurran causas objetivas, razonables y verificables, en razón de:`;
  const C4_P7B = `a) Que la tasa de inflación anual acumulada, conforme a los indicadores oficiales publicados por el organismo competente, supere el diez por ciento (10%), en cuyo caso el incremento de las pensiones se realizará de manera proporcional y razonable a dicho aumento.`;
  const C4_P7C = `b) La ocurrencia de causas objetivas, debidamente justificadas, que afecten el equilibrio económico del servicio educativo.`;
  const C4_P7D = `Cualquier variación en el monto de la pensión será debidamente comunicado al PADRE O MADRE DE FAMILIA con una anticipación no menor a treinta (30) días calendario previos a su aplicación, indicando los motivos del ajuste, sin que ello requiera la suscripción de una adenda, y otorgándole la posibilidad de resolver el contrato sin penalidad para el periodo académico siguiente, conforme a la normativa vigente.`;

  const C4_P8A = `4.8	Si bien el incumplimiento de pago no impedirá el acceso del Alumno a los servicios educativos señalados en el presente Contrato durante el periodo académico en curso, el Colegio podrá retener la entrega de certificados de estudios y constancias administrativas no indispensables para la continuidad educativa, hasta que la deuda sea totalmente cancelada.`;
  const C4_P9A = `4.9	El atraso en el pago de dos (2) pensiones o más, previa comunicación escrita al PADRE O MADRE DE FAMILIA y otorgamiento de un plazo razonable para la regularización de la deuda, podrá ocasionar la pérdida de la vacante asignada al Alumno para el año académico siguiente, sin afectar el desarrollo del periodo académico en curso ni los derechos ya adquiridos.`;

  // --- CLÁUSULA QUINTA: TEXTOS LIMPIOS ---
  const C5_P1A = `5.1 Cumplir fielmente con el objeto del presente Contrato.`;
  const C5_P2A = `5.2 Cumplir con el Plan de Estudio de acuerdo a lo señalado en el presente Contrato.`;
  const C5_P3A = `5.3 	Informar al PADRE O MADRE DE FAMILIA al final de cada bimestre, sobre los resultados del proceso educativo del alumno.`;
  const C5_P4A = `5.4	Ejecutar los Servicios en estricto respeto de la persona humana, buscando siempre el desarrollo, bienestar y cumplimiento de los objetivos trazados por los alumnos.`;
  const C5_P5A = `5.5	Cumplir con el adecuado mantenimiento y accesibilidad de la plataforma virtual; sin embargo, de presentarse fallas en la misma, el PADRE O MADRE DE FAMILIA reconoce que, al ser servicios provistos por terceros, el Colegio no puede garantizar la total disponibilidad del mismo. En este caso, el Colegio se obliga a recuperar la disponibilidad y accesibilidad de la plataforma virtual tan pronto sea posible, una vez detectada o comunicada la falla.`;
  const C5_P6A = `5.6	Cumplir con tener un máximo de alumnos por grupo de estudio conforme lo señalado en el numeral 6.11 del presente Contrato.`;

  // --- RENDERIZADO DEL PDF ---

  // Título Cláusula Cuarta
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA CUARTA. - CONTRAPRESTACIÓN Y FORMA DE PAGO', {
      underline: true,
    });

  // Párrafos 4.1 y 4.2
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P1A, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P2A, { width: TEXT_WIDTH, align: 'justify' });

  doc.moveDown(0.5);
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('MODALIDAD PRESENCIAL O SEMIPRESENCIAL');

  // Tabla de Precios
  const tableData = [
    {
      col1: 'Nivel',
      col2: 'Costo Anual',
      col3: 'Pensión Mensual',
      col4: 'Sedes',
    },
    {
      col1: levelName.toLocaleUpperCase(),
      col2: `S/ ${priceYear}.00`,
      col3: `S/ ${priceMounth}.00`,
      col4: `${campus}`,
    },
  ];
  let tableTop = doc.y;
  generateTable(doc, tableData, tableTop);
  tableTop += 10;

  // Nota al pie de tabla precios
  doc
    .fontSize(7)
    .text(
      '* La relación de sedes y sus ubicaciones se detallan en el Anexo I “Locales escolares” que forma parte integrante del presente contrato.',
      50,
      doc.y + 5,
      { width: TEXT_WIDTH, align: 'left' },
    );

  // Párrafos 4.3 y 4.4
  doc.moveDown();
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P3A, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P4A, { width: TEXT_WIDTH, align: 'justify' });

  // Tabla Cronograma de Pagos
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
    },
  ];
  let tableTop2 = doc.y;
  generateTable2(doc, tableData2, tableTop2);

  // *** CORRECCIÓN CLAVE: Restablecer cursor X después de la tabla ***
  doc.x = 50;
  doc.moveDown();

  // Párrafos 4.5 al 4.9 (Ahora deberían alinearse correctamente a la izquierda)
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P5A, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P6A, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P7A, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P7B, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P7C, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P7D, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P8A, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C4_P9A, { width: TEXT_WIDTH, align: 'justify' });

  // Cláusula Quinta
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA QUINTA. - OBLIGACIONES DEL COLEGIO', { underline: true });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C5_P1A, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C5_P2A, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C5_P3A, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C5_P4A, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C5_P5A, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(C5_P6A, { width: TEXT_WIDTH, align: 'justify' });
}

// Funciones auxiliares para tablas
export function generateTable(doc: PDFKit.PDFDocument, data: any[], y: number) {
  const columnWidths = [100, 100, 100, 100];
  const rowHeight = 15;
  y += rowHeight;
  data.forEach((row) => {
    if (y + rowHeight > doc.page.height - 50) {
      doc.addPage();
      y = 50;
    }
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col1, 55, y + 5, { width: 90, lineBreak: false });
    doc.text(row.col2, 155, y + 5, { width: 90, lineBreak: false });
    doc.text(row.col3, 255, y + 5, { width: 90, lineBreak: false });
    doc.text(row.col4, 355, y + 5, { width: 90, lineBreak: false });
    drawRowLines(doc, y, columnWidths, rowHeight, 450);
    y += rowHeight;
  });
  doc.y = y;
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
    if (y + rowHeight > doc.page.height - 50) {
      doc.addPage();
      y = 50;
    }
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col1, 65, y + 5, { width: 100, lineBreak: false });
    doc.text(row.col2, 165, y + 5, { width: 100, lineBreak: false });
    doc.text(row.col3, 275, y + 5, { width: 100, lineBreak: false });
    doc.text(row.col4, 385, y + 5, { width: 100, lineBreak: false });
    drawRowLines(doc, y, columnWidths, rowHeight, 490);
    y += rowHeight;
  });
  doc.y = y;
}

export function drawRowLines(
  doc: PDFKit.PDFDocument,
  y: number,
  columnWidths: number[],
  rowHeight: number,
  endX: number,
) {
  doc.lineWidth(0.5);
  doc.strokeColor('#000');
  doc.moveTo(50, y).lineTo(endX, y).stroke();
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
    .lineTo(endX, y + rowHeight)
    .stroke();
}
