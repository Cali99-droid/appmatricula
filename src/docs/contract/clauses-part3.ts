import * as PDFDocument from 'pdfkit';

export async function addClausesPart3(
  doc: InstanceType<typeof PDFDocument>,
  email: string,
  telp: string,
  campus: string,
  levelName: string,
  gradeName: string,
  section: string,
  nameSon: string,
) {
  // --- CLÁUSULA DÉCIMO PRIMERA: LEY ---
  const C11_P1A = `Para todas las cuestiones que no estén expresamente contempladas en el presente Contrato.`;
  const C11_P1B = `Ambas partes se someten supletoriamente al Código Civil, LEY N° 29571 Código de protección y defensa del consumidor, LEY N° 26549 Ley de los centros educativos privados, LEY N° 27665 Ley de protección a la economía familiar respecto al pago de pensiones en centros y programas educativos privados, LEY N° 28044 Ley general de educación, LEY N° 29694 Ley que protege a los consumidores de las prácticas abusivas en la selección o adquisición de textos escolares y demás del sistema jurídico que resulten aplicables.`;

  // --- CLÁUSULA DÉCIMO SEGUNDA: JURISDICCIÓN Y CONTROVERSIAS ---
  const C12_P1 = `12.1	Todas las controversias que pudieran derivarse del Contrato, incluidas las que se refieren a su nulidad o invalidez, serán resueltas en primer lugar, mediante trato directo entre las Partes, las mismas que se comprometen a hacer sus mejores esfuerzos para encontrar una solución amigable, dentro de un plazo de 10 (diez) días naturales desde que alguna de las partes solicite por escrito el inicio del trato directo.`;
  const C12_P2 = `12.2	Si las Partes no lograsen solucionar la controversia dentro del plazo establecido en el párrafo precedente y, siendo la intención de las Partes que los problemas que pudieran presentarse con relación al cumplimiento del Contrato se resuelven de la manera más rápida posible, se conviene desde ahora que cualquier litigio, controversia o reclamación entre ellas, relativa a su interpretación, ejecución o validez, será resuelta mediante un arbitraje de derecho.`;
  const C12_P3 = `12.3	El arbitraje será llevado por árbitro único elegido por el Centro de Arbitraje de la Cámara de Comercio de Huaraz (el “Centro”) a solicitud de parte.`;
  const C12_P4 = `12.4	El arbitraje se realizará de acuerdo con las normas establecidas en el Reglamento del Centro y normas (leyes, reglamentos y demás dispositivos) que regulan el arbitraje en el Perú. El laudo arbitral deberá señalar a quién le corresponden los gastos y costos correspondientes al arbitraje. El lugar del arbitraje será en la ciudad de Huaraz y el español será el idioma que se utilizará en el procedimiento arbitral.`;
  const C12_P5 = `12.5	En caso el Centro no pueda responder a la solicitud de arbitraje dentro del plazo de 10 días el arbitraje será Ad-hoc bajo sus propias reglas.`;
  const C12_P6 = `12.6 	En caso de deudas por servicios educativos prestados efectivamente a mérito del presente contrato la Asociación Educativa Luz y Ciencia interpondrá las demandas de obligación de dar suma de dinero ante el poder judicial de la jurisdicción de la provincia de Huaraz.`;

  // --- CLÁUSULA DÉCIMO TERCERA: DATOS ALUMNO ---
  const C13_P1 = `El PADRE O MADRE DE FAMILIA, conoce las obligaciones económicas, aspectos pedagógicos del SERVICIO, voluntariamente matricula a sus hijos:`;
  const C13_P2 = `Una vez seleccionado el local en el presente documento no podrá variarse dicha información hasta la culminación del presente contrato.`;

  // --- CLÁUSULA DÉCIMO CUARTA: DOMICILIO ---
  const C14_P1 = `14.1	Para la validez de todas las comunicaciones y notificaciones de las Partes, con motivo de la ejecución del presente Contrato, éstas señalan como sus respectivos domicilios los indicados en la introducción de este documento.`;
  const C14_P2 = `14.2	De igual manera, las Partes declaran como correos electrónicos válidos para notificaciones de cualquier tipo como parte de este CONTRATO los siguientes:`;
  const C14_P2_Colegio = `- El Colegio: soporte@colegioae.freshdesk.com`;
  const C14_P2_Padre = `- Email del padre o madre de familia: ${email || ''}`;
  const C14_P2_Cel = `- Nro. de Celular: ${telp || ''}`;
  const C14_P3 = `14.3	Las Partes declaran que la sola recepción de un correo electrónico en su bandeja de entrada se considerará como válida computándose los plazos a partir de dicha recepción.`;
  const C14_P4 = `14.4	El cambio de domicilio o de la dirección de correo electrónico de cualquiera de las Partes surtirá efecto a partir del siguiente día hábil de recibida la comunicación por la otra Parte con cualquier medio escrito.`;
  const C14_Final = `En señal de conformidad, ratificación y reconocimiento de ser fiel reflejo de voluntades libremente expresadas, El Colegio firma el presente Contrato y el PADRE O MADRE DE FAMILIA brinda su conformidad presentando este contrato debidamente firmado presencialmente al colegio.`;

  // OBTENER FECHA
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

  // --- RENDERIZADO AL PDF ---

  // DÉCIMO PRIMERA
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA DÉCIMO PRIMERA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - APLICACIÓN SUPLETORIA DE LA LEY.', { underline: false });
  doc.font('Helvetica').fontSize(9).text(`${C11_P1A}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C11_P1B}`, { align: 'justify' });

  // DÉCIMO SEGUNDA
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA DÉCIMO SEGUNDA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - JURISDICCIÓN Y CONTROVERSIAS', { underline: false });
  doc.font('Helvetica').fontSize(9).text(`${C12_P1}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C12_P2}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C12_P3}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C12_P4}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C12_P5}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C12_P6}`, { align: 'justify' });

  // DÉCIMO TERCERA
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA DÉCIMO TERCERA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - DE LOS DATOS DEL ALUMNO MATRICULADO', { underline: false });
  doc.font('Helvetica').fontSize(9).text(`${C13_P1}`, { align: 'justify' });

  const tableData = [
    {
      col1: 'NOMBRE',
      col2: 'SEDE',
      col3: 'NIVEL',
      col4: 'GRADO',
      col5: 'SECCION',
    },
    {
      col1: nameSon,
      col2: campus,
      col3: levelName,
      col4: gradeName,
      col5: section,
    }, // Ajuste de orden según pdf anterior o gusto
  ];
  let tableTop = doc.y;
  generateTable(doc, tableData, tableTop);
  tableTop += 10;

  doc.fontSize(7).text(`${C13_P2}`, 50, doc.y + 5);

  // DÉCIMO CUARTA
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA DÉCIMO CUARTA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - DOMICILIO', { underline: false });
  doc.font('Helvetica').fontSize(9).text(`${C14_P1}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C14_P2}`, { align: 'justify' });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${C14_P2_Colegio}`, { align: 'justify' });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${C14_P2_Padre}`, { align: 'justify' });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${C14_P2_Cel}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C14_P3}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C14_P4}`, { align: 'justify' });

  doc.moveDown();
  doc.font('Helvetica').fontSize(9).text(`${C14_Final}`, { align: 'justify' });

  doc.moveDown(2);
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`Huaraz, ${day} de ${monthName} del ${year}`, { align: 'right' });
}

export function generateTable(doc: PDFKit.PDFDocument, data: any[], y: number) {
  const columnWidths = [100, 100, 100, 100]; // Ajustar según necesidad visual
  const rowHeight = 15;
  y += rowHeight;
  data.forEach((row) => {
    // Nota: El orden visual en el codigo anterior ponía nombre al final, aquí lo he puesto primero para calzar, ajusta indices si prefieres.
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col1, 55, y + 5); // Nombre
    doc.text(row.col2, 155, y + 5); // Sede
    doc.text(row.col3, 255, y + 5); // Nivel
    doc.text(row.col4, 355, y + 5); // Grado
    // Falta Seccion visualmente si hay 5 columnas, ajusta widths si es necesario.
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
