import * as PDFDocument from 'pdfkit';

export function addClausesPart2(
  doc: InstanceType<typeof PDFDocument>,
  year: string,
  dayClassStart: string,
  dayClassEnd: string,
) {
  //TEXTO DE CLAUSULA SEXTA
  const C6_P1 = `Por medio del presente Contrato, el PADRE O MADRE DE FAMILIA declara lo siguiente:`;
  const C6_P1A = `6.1 Que, ha leído, entendido y acepta sujetarse al reglamento interno del Colegio la misma que le fue informada con la`;
  const C6_P1B = `debida antelación a la firma del presente Contrato; sin perjuicio de ello, el PADRE O MADRE DE FAMILIA podrá acceder`;
  const C6_P1C = `a dicho documento en cualquier momento a través de la página institucional del Colegio.`;

  const C6_P2A = `6.2 Que, el PADRE O MADRE DE FAMILIA ceden a perpetuidad y a título gratuito en favor del Colegio el uso del derecho`;
  const C6_P2B = `a imagen y nombre del Alumno, los mismos que podrán ser utilizados en medios publicitarios a nivel nacional e`;
  const C6_P2C = `internacional, así como en cualquier medio audiovisual y escrito que el Colegio crea pertinente para difundir su labor educativa.`;

  const C6_P3A = `6.3 Que, el Colegio decide la conformación de las secciones de estudio de los alumnos respetando el orden de matrícula.`;
  const C6_P3B = `Esta decisión es definitiva y el PADRE O MADRE DE FAMILIA se compromete a respetarla`;

  const C6_P4A = `6.4 Que, declara conocer que el incumplimiento de pago autoriza al Colegio a iniciar acciones legales contra el PADRE O `;
  const C6_P4B = `MADRE DE FAMILIA y lo facultan a comunicar a centrales de riesgo e inicio de procesos judiciales.`;

  const C6_P5A = `6.5	Que, conoce que toda la información y material provisto u obtenido por él en la ejecución del Servicio es de propiedad`;
  const C6_P5B = `del Colegio, ello incluye de modo enunciativo, mas no limitativo, material audiovisual, bibliográfico, separatas, modelos`;
  const C6_P5C = `de exámenes, etc. Estando prohibida su reproducción parcial o total, quedando el Colegio facultado para iniciar las`;
  const C6_P5D = `acciones legales pertinentes en caso de uso indebido.`;

  const C6_P6A = `6.6 Que el usuario y clave de acceso a la Plataforma virtual es personal e intransferible. El PADRE O MADRE DE FAMILIA`;
  const C6_P6B = `se obliga a hacer un uso adecuado de la plataforma bajo responsabilidad.`;

  const C6_P7A = `6.7	Que, el Colegio no se responsabiliza por la suspensión de actividades por caso fortuito o fuerza mayor, sea en la`;
  const C6_P7B = `modalidad presencial o por la eventual caída de los servidores de la Plataforma virtual, quedando el PADRE O MADRE`;
  const C6_P7C = `DE FAMILIA comprometidas a acatar cualquier medida extraordinaria para la recuperación de clases que el Colegio apruebe para el cumplimiento del plan de estudios.`;

  const C6_P8A = `6.8 Que, en caso de que el Alumno exhiba ”Deficiencia Académica” en dos bimestres o trimestres consecutivos, y sea`;
  const C6_P8B = `desaprobado en 4 o más áreas (secundaria) se procederá con el traslado del alumno del plantel en el presente año `;
  const C6_P8C = `académico, previniendo así una inversión improductiva.`;

  const C6_P9A = `6.9 Que, en casos de dificultades evidentes a nivel conductual del alumno y/o padre de familia, luego de un seguimiento`;
  const C6_P9B = `documentado y frecuente sobre la conducta, y habiendo sido informado sobre dicho seguimiento, si es que no se`;
  const C6_P9C = `evidenciará una mejora en el comportamiento o el PADRE O MADRE DE FAMILIA no cumpliera con los acuerdos`;
  const C6_P9D = `realizados con el Colegio, no se podrá efectuar la matrícula al año siguiente, decisión que será comunicada por escrito`;
  const C6_P9E = `y que es inimpugnable, por constituir una condición aceptada previamente a la prestación del servicio educativo.`;

  const C6_P10A = `6.10 Que, si el Alumno repitiese de año, perderá`;
  const C6_P10B = `el derecho de renovar la matrícula en el Colegio al siguiente año.`;

  const C6_P11A = `6.11 Acepta que, para el Año Académico ${year} se respetara el número máximo de alumnos por sección según la tabla:`;

  const C6_P12A = `6.12 Que, en caso el Alumno sea trasladado a otra Institución Educativa por cualquier motivo y dentro del plazo establecido`;
  const C6_P12B = `por la normativa vigente, será comunicado oportunamente a la Dirección del Colegio mediante el proceso definido por`;
  const C6_P12C = `la institución, teniendo el Colegio 7 días hábiles para la entrega de la documentación solicitada. Este trámite sólo`;
  const C6_P12D = `se puede realizar de forma personal por parte del PADRE O MADRE DE FAMILIA, presentando una solicitud y la`;
  const C6_P12E = `constancia de vacante de la Institución Educativa de destino.`;

  const C6_P13A = `6.13 El PADRE O MADRE DE FAMILIA conocen y aceptan que el Colegio brindará información a ambos padres excepto en`;
  const C6_P13B = `los casos en el cual uno de los padres tenga sentencia judicial de suspensión o extinción de la patria potestad y`;
  const C6_P13C = `comunique el mismo formalmente a la secretaría del Colegio adjuntando la sentencia correspondiente.`;

  const C6_P14A = `6.14	Que el PADRE O MADRE DE FAMILIA se obliga a asistir a las reuniones convocadas por el Colegio, las mismas que`;
  const C6_P14B = `incluye de manera enunciativa más no limitativa, a (i) actividades académicas, (ii) reuniones convocadas por el director,`;
  const C6_P14C = `profesores o departamento psicológico, (iii) Actividades de recreación, (iv) capacitaciones y/o reuniones individuales que`;
  const C6_P14D = `realizará el Colegio para los Padres de Familia con la finalidad de conocer y manejar la Plataforma Virtual y otros.`;

  const C6_P15A = `6.15	Reconoce que, cuando el Colegio o alguna autoridad competente disponga la realización de actividades en la modalidad`;
  const C6_P15B = `virtual; para hacer uso de la plataforma virtual requerirá contar con una computadora, laptop, con acceso OBLIGATORIO DE AUDIO, VIDEO Y MICRÓFONO con las siguientes condiciones mínimas:`;
  const C6_P15C = `Computadoras o laptops`;
  const C6_P15D = `- Intel core 2 duo, 4GB de memoria RAM.`;
  const C6_P15E = `- Velocidad de internet en modo descarga de 20Mbps.`;

  const C6_P16A = `6.16	Que, el incumplimiento de cualquiera de estas declaraciones por su parte facultará al Colegio a iniciar medidas`;
  const C6_P16B = `disciplinarias internas, así como a acudir a las autoridades competentes sobre derechos de autor, marcas, patentes y otros.`;

  //TEXTO DE CLAUSULA SEPTIMA
  const C7_P1A = `La vigencia del Contrato se sujeta al calendario escolar dispuesto para este año para las tres modalidades, el mismo que se inicia`;
  const C7_P1B = `el ${dayClassStart}  y culmina el ${dayClassEnd} `;

  //TEXTO DE CLAUSULA OTAVA
  const C8_P1A = `El PADRE O MADRE DE FAMILIA podrá controlar o verificar, a su propio costo y cargo, la ejecución de los Servicios`;
  const C8_P1B = `comprometiéndose a tratar en primera instancia y de manera directa cualquier deficiencia, queja o reclamo ante la dirección del`;
  const C8_P1C = `Colegio, a efectos de encontrar la mejor solución posible.`;

  //TEXTO DE CLAUSULA NOVENA
  const C9_P1A = `El Colegio brindará los siguientes servicios de apoyo al Estudiante:`;
  const C9_P2A = `9.1 Servicio de Tutoría Académica`;
  const C9_P3A = `9.2 Servicio de Tutoría Psicológica `;
  // const C9_P4A = `9.3 Servicio de Tutoría Técnica `;
  const C9_P5A = `Estos servicios serán brindados de acuerdo a la necesidad del alumno definida por la ASOCIACIÓN y/o a requerimiento del`;
  const C9_P5B = `PADRE O MADRE DE FAMILIA. Su no ejecución no condiciona el pago de pensiones ni de las demás obligaciones económicas`;
  const C9_P5C = `contempladas en el presente Contrato.`;

  //TEXTO DE CLAUSULA DECIMA
  const C10_P1A = `En el caso que una o varias cláusulas contenidas en el Contrato puedan ser consideradas incompatibles y/o inválida con alguna`;
  const C10_P1B = `disposición legal, vigente o futura, dicha incompatibilidad y/o invalidez no afectará a las restantes, las que mantendrán su plena`;
  const C10_P1C = `vigencia debiéndose interpretar aquellas cláusulas incompatibles o inválidas como inexistentes.`;

  // CLAUSULA SEXTA
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA SEXTA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - OBLIGACIONES Y DECLARACIONES DEL PADRE O MADRE DE FAMILIA', {
      underline: false,
    });
  doc.font('Helvetica').fontSize(9).text(`${C6_P1}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P1A} ${C6_P1B} ${C6_P1C}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P2A} ${C6_P2B} ${C6_P2C}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P3A} ${C6_P3B}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P4A} ${C6_P4B}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P5A} ${C6_P5B} ${C6_P5C} ${C6_P5D}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P6A} ${C6_P6B}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P7A} ${C6_P7B} ${C6_P7C}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P8A} ${C6_P8B} ${C6_P8C}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P9A} ${C6_P9B} ${C6_P9C} ${C6_P9D} ${C6_P9E}`, {
      align: 'justify',
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P10A} ${C6_P10B}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C6_P11A}`, { align: 'justify' });

  // doc.addPage();
  const tableData = [
    {
      col1: 'INICIAL',
      col2: 'PRIMARIA',
      col3: 'SECUNDARIA',
    },
    {
      col1: '22 Alumnos',
      col2: '30 Alumnos',
      col3: '30 Alumnos',
    },
  ];
  let tableTop = doc.y;

  generateTable(doc, tableData, tableTop);
  // Incrementar 'y' para posicionar el texto debajo de la tabla
  tableTop += 10; // Añade un espacio adicional debajo de la tabla para separar el texto

  doc
    .fontSize(7)
    .text(
      '(*) En el primer grado de primaria el número máximo será de 32.',
      50,
      doc.y + 5,
    );
  doc.moveDown();
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P12A} ${C6_P12B} ${C6_P12C} ${C6_P12D} ${C6_P12E}`, {
      align: 'justify',
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P13A} ${C6_P13B} ${C6_P13C}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P14A} ${C6_P14B} ${C6_P14C} ${C6_P14D}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P15A} ${C6_P15B}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C6_P15C}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C6_P15D}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C6_P15E}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P16A} ${C6_P16B} `, { align: 'justify' });
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA SÉPTIMA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - DEL PLAZO DE EJECUCIÓN DEL SERVICIO', {
      underline: false,
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C7_P1A} ${C7_P1B} `, { align: 'justify' });
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA OCTAVA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - DE LA SUPERVISIÓN DE LOS SERVICIOS', {
      underline: false,
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C8_P1A} ${C8_P1B} ${C8_P1C}`, { align: 'justify' });
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA NOVENA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - DE LOS SERVICIOS DE APOYO AL ESTUDIANTE', {
      underline: false,
    });
  doc.font('Helvetica').fontSize(9).text(`${C9_P1A}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C9_P2A}`, { align: 'justify' });
  doc.font('Helvetica').fontSize(9).text(`${C9_P3A}`, { align: 'justify' });
  // doc.font('Helvetica').fontSize(9).text(`${C9_P4A}`, { align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C9_P5A} ${C9_P5B} ${C9_P5C}`, { align: 'justify' });
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA DÉCIMA', { continued: true, underline: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('. - INCOMPATIBILIDAD DE CLÁUSULAS', {
      underline: false,
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C10_P1A} ${C10_P1B} ${C10_P1C}`, { align: 'justify' });
}
export function generateTable(doc: PDFKit.PDFDocument, data: any[], y: number) {
  const columnWidths = [100, 100, 100];
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
  doc.moveTo(50, y).lineTo(350, y).stroke();

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
    .lineTo(350, y + rowHeight)
    .stroke();
}
