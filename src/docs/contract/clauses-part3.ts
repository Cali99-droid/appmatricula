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
  //TEXTO DE DÉCIMO  PRIMERA
  const C11_P1A = `Para todas las cuestiones que no estén expresamente contempladas en el presente Contrato. Ambas partes se someten`;
  const C11_P1B = `supletoriamente al Código Civil, LEY N° 29571 Código de protección y defensa del consumidor, LEY N° 26549 Ley de los centros`;
  const C11_P1C = `educativos privados, LEY N° 27665 Ley de protección a la economía familiar respecto al pago de pensiones en centros y`;
  const C11_P1D = `programas educativos privados, LEY N° 28044 Ley general de educación, LEY N° 29694 Ley que protege a los consumidores`;
  const C11_P1E = `de las prácticas abusivas en la selección o adquisición de textos escolares y demás del sistema jurídico que resulten aplicables.`;
  //TEXTO DE DÉCIMO  SEGUNDA
  const C12_P1A = `El presente Contrato quedará resuelto en caso de que el Alumno sea separado definitivamente del Colegio conforme lo estipulado`;
  const C12_P1B = `en el Reglamento Interno del Colegio.`;
  //TEXTO DE DÉCIMO  TERCERA
  const C13_P1A = `13.1	Todas las controversias que pudieran derivarse del Contrato, incluidas las que se refieren a su nulidad o invalidez, serán`;
  const C13_P1B = `resueltas en primer lugar, mediante trato directo entre las Partes, las mismas que se comprometen a hacer sus mejores`;
  const C13_P1C = `esfuerzos para encontrar una solución amigable, dentro de un plazo de 10 (diez) días naturales desde que alguna de`;
  const C13_P1D = `las partes solicite por escrito el inicio del trato directo.`;
  const C13_P2A = `13.2	Si las Partes no lograsen solucionar la controversia dentro del plazo establecido en el párrafo precedente y, siendo la`;
  const C13_P2B = `intención de las Partes que los problemas que pudieran presentarse con relación al cumplimiento del Contrato se`;
  const C13_P2C = `resuelven de la manera más rápida posible, se conviene desde ahora que cualquier litigio, controversia o reclamación`;
  const C13_P2D = `entre ellas, relativa a su interpretación, ejecución o validez, será resuelta mediante un arbitraje de derecho.`;
  const C13_P3A = `13.3	El arbitraje será llevado por árbitro único elegido por el Centro de Arbitraje de la Cámara de Comercio de Huaraz (el `;
  const C13_P3B = `“Centro”) a solicitud de parte.`;
  const C13_P4A = `13.4	El arbitraje se realizará de acuerdo con las normas establecidas en el Reglamento del Centro y normas (leyes,`;
  const C13_P4B = `reglamentos y demás dispositivos) que regulan el arbitraje en el Perú. El laudo arbitral deberá señalar a quién le`;
  const C13_P4C = `corresponden los gastos y costos correspondientes al arbitraje. El lugar del arbitraje será en la ciudad de Huaraz y el`;
  const C13_P4D = `español será el idioma que se utilizará en el procedimiento arbitral.`;
  const C13_P5A = `13.5	En caso el Centro no pueda responder a la solicitud de arbitraje dentro del plazo de 10 días el arbitraje será Ad-hoc bajo`;
  const C13_P5B = `sus propias reglas.`;
  //TEXTO DE DÉCIMO  CUARTA
  const C14_P1A = `El PADRE O MADRE DE FAMILIA, conoce las obligaciones económicas, aspectos pedagógicos del SERVICIO, voluntariamente matricula a sus hijos:`;
  //TEXTO DE DÉCIMO  QUINTA
  const C15_P1A = `15.1	Para la validez de todas las comunicaciones y notificaciones de las Partes, con motivo de la ejecución del presente`;
  const C15_P1B = `Contrato, éstas señalan como sus respectivos domicilios los indicados en la introducción de este documento.`;
  const C15_P2A = `15.2	De igual manera, las Partes declaran como correos electrónicos válidos para notificaciones de cualquier tipo como parte`;
  const C15_P2B = `de este CONTRATO los siguientes:`;
  const C15_P2C = `- El Colegio: soporte@colegioae.freshdesk.com`;
  const C15_P2D = `- Email del padre o madre de familia: ${email == undefined ? '' : email}`;
  const C15_P2E = `- Nro. de Celular: ${telp == undefined ? '' : telp}`;
  const C15_P3A = `15.3	Las Partes declaran que la sola recepción de un correo electrónico en su bandeja de entrada se considerará como válida`;
  const C15_P3B = `computándose los plazos a partir de dicha recepción.`;
  const C15_P4A = `15.4	El cambio de domicilio o de la dirección de correo electrónico de cualquiera de las Partes surtirá efecto a partir del`;
  const C15_P4B = `siguiente día hábil de recibida la comunicación por la otra Parte con cualquier medio escrito.`;
  const C15_P5A = `En señal de conformidad, ratificación y reconocimiento de ser fiel reflejo de voluntades libremente expresadas, El Colegio firma`;
  const C15_P5B = `el presente Contrato y el PADRE O MADRE DE FAMILIA brinda su conformidad enviando este presentando este contrato`;
  const C15_P5C = `debidamente firmado, presencial o virtualmente, al colegio.`;
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
  // CLAUSULA DÉCIMO
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA DÉCIMO PRIMERA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - APLICACIÓN SUPLETORIA DE LA LEY.', {
      underline: false,
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C11_P1A} ${C11_P1B} ${C11_P1B} ${C11_P1C} ${C11_P1D} ${C11_P1E}`, {
      align: 'justify',
    });
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA DÉCIMO SEGUNDA', { continued: true, underline: true });
  doc.font('Helvetica-Bold').fontSize(9).text('. - RESOLUCIÓN DE CONTRATO', {
    underline: false,
  });
  doc.font('Helvetica').fontSize(9).text(`${C12_P1A} ${C12_P1B}`, {
    align: 'justify',
  });
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA DÉCIMO TERCERA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - JURISDICCIÓN Y CONTROVERSIAS', {
      underline: false,
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C13_P1A} ${C13_P1B} ${C13_P1C} ${C13_P1D}`, {
      align: 'justify',
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C13_P2A} ${C13_P2B} ${C13_P2C} ${C13_P2D}`, {
      align: 'justify',
    });
  doc.font('Helvetica').fontSize(9).text(`${C13_P3A} ${C13_P3B}`, {
    align: 'justify',
  });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C13_P4A} ${C13_P4B} ${C13_P4C} ${C13_P4D}`, {
      align: 'justify',
    });
  doc.font('Helvetica').fontSize(9).text(`${C13_P5A} ${C13_P5B}`, {
    align: 'justify',
  });

  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA DÉCIMO CUARTA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - DE LOS DATOS DEL ALUMNO MATRICULADO', {
      underline: false,
    });
  doc.font('Helvetica').fontSize(9).text(`${C14_P1A}`, {
    align: 'justify',
  });
  // doc.addPage();
  const tableData = [
    {
      col1: 'NOMBRE',
      col2: 'SEDE',
      col3: 'NIVEL',
      col4: 'GRADO',
      col5: 'SECCION',
    },
    {
      col1: campus,
      col2: levelName,
      col3: gradeName,
      col4: section,
      col5: nameSon,
    },
  ];
  let tableTop = doc.y;

  generateTable(doc, tableData, tableTop);
  // Incrementar 'y' para posicionar el texto debajo de la tabla
  tableTop += 10; // Añade un espacio adicional debajo de la tabla para separar el texto

  doc
    .fontSize(7)
    .text(
      'Una vez seleccionado el local en el presente documento no podrá variarse dicha información hasta la culminación del presente contrato.',
      50,
      doc.y + 5,
    );
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA DÉCIMO QUINTA', { continued: true, underline: true });
  doc.font('Helvetica-Bold').fontSize(9).text('. - DOMICILIO ', {
    underline: false,
  });
  doc.font('Helvetica').fontSize(9).text(`${C15_P1A} ${C15_P1B}`, {
    align: 'justify',
  });
  doc.font('Helvetica').fontSize(9).text(`${C15_P2A} ${C15_P2B}`, {
    align: 'justify',
  });
  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(9).text(`${C15_P2C}`, {
    align: 'justify',
  });
  doc.font('Helvetica-Bold').fontSize(9).text(`${C15_P2D}`, {
    align: 'justify',
  });
  doc.font('Helvetica-Bold').fontSize(9).text(`${C15_P2E}`, {
    align: 'justify',
  });
  doc.moveDown();
  doc.font('Helvetica').fontSize(9).text(`${C15_P3A} ${C15_P3B}`, {
    align: 'justify',
  });
  doc.font('Helvetica').fontSize(9).text(`${C15_P4A} ${C15_P4B}`, {
    align: 'justify',
  });
  doc.font('Helvetica').fontSize(9).text(`${C15_P5A} ${C15_P5B} ${C15_P5C}`, {
    align: 'justify',
  });
  doc.moveDown();
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`Huaraz, ${day} de ${monthName} del ${year}`, {
      align: 'right',
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
