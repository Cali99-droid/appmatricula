// import PDFDocument from 'pdfkit';
// import 'pdfkit-table';
// const PDFDocument = require('pdfkit');
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
  //TEXTO DE CLAUSULA PRIMERA
  const C4_P1A = `4.1 El PADRE O MADRE DE FAMILIA se compromete a pagar el monto de matrícula para cada uno de los tres niveles,`;
  //nomeclatura (trescientos cincuenta y 00/100 soles)(trescientos cincuenta y 00/100 soles)
  const C4_P1B = `ascendiente a S/ ${priceEnrollment}.00  y la cuota de ingreso (solo alumnos nuevos) es de S/ ${priceAdmission}.00 .`;
  const C4_P2A = `4.2 El PADRE O MADRE DE FAMILIA conoce y acepta el monto anual del servicio educativo, el mismo que es financiado en 10 pensiones mensuales: `;

  const C4_P3A = `4.3	El PADRE O MADRE DE FAMILIA declara conocer la infraestructura de los locales de la ASOCIACIÓN señalados en el`;
  const C4_P3B = `Anexo 1, así como la proporcionalidad entre el costo de las pensiones y el servicio educativo a brindarse.`;
  const C4_P4A = `4.4 El PADRE O MADRE DE FAMILIA se compromete a pagar oportunamente las diez (10) pensiones mensuales fijas de`;
  const C4_P4B = `marzo a diciembre, respetando las siguientes fechas de vencimiento de cada pensión:`;

  // const C4_P5A = `4.5	El PADRE O MADRE DE FAMILIA que tiene 2 o más hijos en el Colegio gozará de descuenta S/10.00 por hermano en`;
  // const C4_P5B = `las pensiones mensuales pagadas antes de su fecha de vencimiento, sólo en los niveles Primaria y Secundaria, el nivel`;
  // const C4_P5C = `Inicial no goza de este beneficio.`;
  const C4_P6A = `4.5	El Colegio aplicará la tasa de interés máxima legal sobre las pensiones mensuales vencidas, el mismo que correrá a`;
  const C4_P6B = `partir del día siguiente de la fecha de vencimiento, de acuerdo al cronograma señalado en el presente contrato.`;
  const C4_P7A = `4.6	El pago realizado por concepto de cuota de ingreso efectuado por los Padres y Madres de Familia garantiza el derecho del Alumno a una vacante en el Colegio, de acuerdo a lo establecido en la normativa educativa vigente.`;
  const C4_P8A = `4.7 El Colegio podrá variar unilateralmente el monto de la pensión por los Servicios en razón de:`;
  const C4_P8B = `a)	La tasa de inflación supere el 10%, en dicho caso el aumento de las pensiones se dará proporcionalmente al aumento de la tasa de inflación.`;
  const C4_P8C = `b)  Causas objetivas, debidamente justificadas que afecten el equilibrio económico financiero del presente contrato.`;
  const C4_P8D = `Cualquier aumento en la pensión será debidamente comunicado al PADRE O MADRE DE FAMILIA con al menos treinta`;
  const C4_P8E = `(30) días naturales previos a la aplicación del aumento, el cual no requerirá la firma de una adenda.`;
  const C4_P9A = `4.8	Si bien el incumplimiento de pago no impedirá el acceso a los servicios educativos señalados en el presente Contrato, `;
  const C4_P9B = `el Colegio retendrá el Certificado de Estudio del Alumno hasta que la deuda sea totalmente cancelada.`;
  const C4_P10A = `4.9	El atraso en el pago de pensiones, así como mantener cualquier tipo de deuda con el Colegio ocasionará la pérdida de`;
  const C4_P10B = `la vacante asignada al Alumno para el año próximo inmediato.`;
  //TEXTO DE CLAUSULA QUINTA
  const C5_P1A = `5.1 Cumplir fielmente con el objeto del presente Contrato.`;
  const C5_P2A = `5.2 Cumplir con el Plan de Estudio de acuerdo a lo señalado en el presente Contrato.`;
  const C5_P3A = `5.3 Informar al PADRE O MADRE DE FAMILIA al final de cada bimestre, sobre los resultados del proceso educativo del alumno.
                  En tal sentido, salvo lo dispuesto en el presente literal, el colegio no realiza informes académicos a solicitud del Padre o Madre de familia.`;
  const C5_P4A = `5.4	Ejecutar los Servicios en estricto respeto de la persona humana, buscando siempre el desarrollo, bienestar y cumplimiento de los objetivos trazados por los alumnos.`;
  const C5_P5A = `5.5	Cumplir con el adecuado mantenimiento y accesibilidad de la plataforma virtual; sin embargo, de presentarse fallas en`;
  const C5_P5B = `la misma, el PADRE O MADRE DE FAMILIA reconoce que, al ser servicios provistos por terceros, el Colegio no puede`;
  const C5_P5C = `garantizar la total disponibilidad del mismo. En este caso, el Colegio se compromete a recuperar la disponibilidad y accesibilidad`;
  const C5_P5D = `de la plataforma virtual tan pronto sea posible, una vez detectada o comunicada la falla, lo cual será comunicado al correo electrónico.`;
  const C5_P6A = `5.6	Cumplir con tener un máximo de alumnos por grupo de estudio conforme lo señalado en el numeral 6.11 del presente Contrato.`;

  // CLAUSULA CUARTA
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
  doc.addPage();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('MODALIDAD PRESENCIAL O SEMIPRESENCIAL');
  const tableData = [
    {
      col1: '',
      col2: '      Coste Anual',
      col3: '    Pensión Mensual',
      col4: '           Local',
    },
    {
      col1: levelName,
      col2: `S/ ${priceYear}.00`,
      col3: `S/ ${priceMounth}.00`,
      col4: campus,
    },
  ];
  let tableTop = doc.y;

  generateTable(doc, tableData, tableTop);
  // Incrementar 'y' para posicionar el texto debajo de la tabla
  tableTop += 10; // Añade un espacio adicional debajo de la tabla para separar el texto

  // Agregar texto debajo de la tabla
  doc
    .fontSize(7)
    .text(
      '* La relación de locales y sus ubicaciones se detallan en el Anexo I “Locales escolares” que forma parte integrante del presente contrato.',
      50,
      doc.y + 5,
    );
  doc.moveDown();
  // doc.font('Helvetica').fontSize(9).text(`${C4_P2A}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C4_P3A} ${C4_P3B}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C4_P4A} ${C4_P4B}`, { align: 'justify' });
  const tableData2 = [
    {
      col1: 'Cuota',
      col2: 'Fecha de Vencimiento',
      col3: 'Cuota',
      col4: 'Fecha de Vencimiento',
    },
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
      col4: '17 de diciembre',
    },
  ];
  let tableTop2 = doc.y;

  generateTable2(doc, tableData2, tableTop2);
  // Incrementar 'y' para posicionar el texto debajo de la tabla
  tableTop2 += 10;
  doc.moveDown();
  // doc
  //   .font('Helvetica')
  //   .fontSize(9)
  //   .text(`${C4_P5A} ${C4_P5B} ${C4_P5C}`, 50, doc.y + 5, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C4_P6A} ${C4_P6B}`, 50, doc.y + 5, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C4_P7A}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C4_P8A}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C4_P8B}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C4_P8C}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C4_P8D} ${C4_P8E}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C4_P9A} ${C4_P9B}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C4_P10A} ${C4_P10B}`, { align: 'justify' });
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
    .text(`${C5_P5A} ${C5_P5B} ${C5_P5C} ${C5_P5D}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C5_P6A}`, { align: 'justify' });
}
export function generateTable2(
  doc: PDFKit.PDFDocument,
  data: any[],
  y: number,
) {
  const columnWidths = [110, 110, 110, 110];
  const rowHeight = 15;

  // Dibujar encabezado de la tabla
  // doc.fontSize(12).text('Columna 1', 50, y);
  // doc.text('Columna 2', 200, y);
  // doc.text('Columna 3', 350, y);

  y += rowHeight;

  // Dibujar filas de la tabla
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
    // Nueva columna
    // Dibujar líneas de las filas
    drawRowLines2(doc, y, columnWidths, rowHeight);

    y += rowHeight;
  });
}
export function generateTable(doc: PDFKit.PDFDocument, data: any[], y: number) {
  const columnWidths = [100, 100, 100, 100];
  const rowHeight = 15;

  y += rowHeight;

  // Dibujar filas de la tabla
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
    // Nueva columna
    // Dibujar líneas de las filas
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
  doc.moveTo(50, y).lineTo(450, y).stroke();

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
    .lineTo(450, y + rowHeight)
    .stroke();
}
export function // Dibujar las líneas de cada fila
drawRowLines2(
  doc: PDFKit.PDFDocument,
  y: number,
  columnWidths: number[],
  rowHeight: number,
) {
  doc.lineWidth(0.5);
  doc.strokeColor('#000');

  // Dibujar la línea superior de la fila
  doc.moveTo(50, y).lineTo(490, y).stroke();

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
    .lineTo(490, y + rowHeight)
    .stroke();
}
