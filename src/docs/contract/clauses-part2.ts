import * as PDFDocument from 'pdfkit';

export function addClausesPart2(
  doc: InstanceType<typeof PDFDocument>,
  year: string,
  dayClassStart: string,
  dayClassEnd: string,
) {
  doc.x = 50;
  const TEXT_WIDTH = 495; // Ancho forzado para justificación correcta

  // --- TEXTOS ---
  const C6_Intro = `Por medio del presente Contrato, el PADRE O MADRE DE FAMILIA declara lo siguiente:`;
  const C6_P1A = `6.1 	Que ha recibido, leído y comprendido el Reglamento Interno del Colegio correspondiente al año 2026, el cual le fue informado con la debida antelación a la suscripción del presente Contrato, comprometiéndose a su cumplimiento en tanto no contravenga lo dispuesto en el presente Contrato ni la normativa vigente, pudiendo acceder a dicho documento en formato impreso y a través de la página institucional del Colegio.`;
  const C6_P2A = `6.2 	Que el PADRE O MADRE DE FAMILIA autoriza de manera expresa, gratuita y revocable al Colegio el uso del nombre y la imagen del Alumno, exclusivamente con fines institucionales, educativos y de difusión de la labor educativa, en medios impresos, audiovisuales o digitales, a nivel nacional e internacional, durante la vigencia de la relación educativa, pudiendo revocar dicha autorización mediante comunicación escrita.`;
  const C6_P3A = `6.3 	Que el Colegio determina la conformación de las secciones de estudio de los alumnos y podrá variar la ubicación de las aulas, considerando criterios pedagógicos, organizativos y el orden de matrícula, salvaguardando en todo momento el bienestar emocional y el desarrollo académico del Alumno, lo cual será oportunamente informado al PADRE O MADRE DE FAMILIA.`;
  const C6_P3B = `Una vez establecida la ubicación del alumno en sus respectivo grado y sección, el padre de familia no podrá solicitar cambio de la misma, salvo justificaciones de peso comprobadas, que lo justifiquen y después de ser evaluada por el departamento de psicología y el Comité de Convivencia.`;
  const C6_P4A = `6.4 	Que declara conocer que el incumplimiento de las obligaciones de pago faculta al Colegio, previo requerimiento de pago, a iniciar las acciones legales que correspondan para la recuperación de la deuda, así como, de ser el caso y conforme a la normativa vigente, a comunicar la situación de incumplimiento a las centrales de riesgo.`;
  const C6_P5A = `6.5	Que, conoce que es de propiedad del Colegio toda la información y material provisto u obtenido por él, en la ejecución del Servicio, ello incluye de modo enunciativo, mas no limitativo, material audiovisual, bibliográfico, separatas, modelos de exámenes, etc. Estando prohibida su reproducción parcial o total, quedando el Colegio facultado para iniciar las acciones legales pertinentes en caso de uso indebido.`;
  const C6_P6A = `6.6 	Que, de ser necesario pasar a una educación virtual por disposición de la autoridad competente o por causas debidamente justificadas, el usuario y la clave de acceso a la plataforma virtual serán personales e intransferibles, comprometiéndose el PADRE O MADRE DE FAMILIA a realizar un uso adecuado y responsable de la misma, conforme a las normas de uso establecidas por el Colegio.`;
  const C6_P7A = `6.7	Que el Colegio no será responsable por la suspensión temporal de actividades derivada de caso fortuito o fuerza mayor, ni por fallas técnicas en servidores de la plataforma virtual ajenas a su control;`;
  const C6_P7B = `en tales supuestos, el PADRE O MADRE DE FAMILIA se compromete a acatar las medidas extraordinarias, razonables y debidamente comunicadas que el Colegio disponga para la recuperación de clases y el cumplimiento del plan de estudios.`;
  const C6_P8A = `6.8 		Que, en caso de presentarse dificultades conductuales evidentes del Alumno y/o del PADRE O MADRE DE FAMILIA, y luego de realizarse un seguimiento documentado, continuo y oportunamente informado, sin evidenciarse una mejora en la conducta del Alumno o ante el incumplimiento de los acuerdos adoptados con el Colegio, éste podrá condicionar la renovación de la matrícula para el periodo académico siguiente, priorizando el interés superior del Alumno, así como poner en conocimiento de las autoridades o instituciones competentes la situación (DEMUNA, UGEL, FISCALÍA, Centro de Emergencia Mujer, Centro de Salud Mental Comunitario, Defensoría del Pueblo), cuando ello resulte necesario y conforme a la normativa vigente.`;
  const C6_P9A = `6.9 		Acepta que, para el Año Académico 2026, el Colegio respetará el número máximo de alumnos por sección, conforme a la tabla:`;
  const C6_P10A = `6.10 	Que, en caso el Alumno sea trasladado a otra Institución Educativa por cualquier motivo y dentro del plazo establecido por la normativa vigente, dicho traslado deberá ser comunicado oportunamente a la Dirección del Colegio, siguiendo el procedimiento institucional establecido.`;
  const C6_P10B = `En tal supuesto, el Colegio contará con un plazo de hasta siete (7) días hábiles para la entrega de la documentación correspondiente, siempre que el trámite sea realizado de manera personal por el PADRE O MADRE DE FAMILIA, mediante solicitud escrita y la presentación de la constancia de vacante emitida por la Institución Educativa de destino.`;
  const C6_P11A = `6.11 	El PADRE O MADRE DE FAMILIA conoce y acepta que el Colegio brindará información académica y administrativa a ambos padres, salvo en los casos en que exista sentencia judicial firme de suspensión, restricción o extinción de la patria potestad respecto de uno de ellos, debidamente comunicada y acreditada ante la Secretaría del Colegio mediante la presentación de la resolución correspondiente.`;
  const C6_P12A = `6.12	Que el PADRE O MADRE DE FAMILIA se obliga a asistir a las reuniones convocadas por el Colegio, las mismas que incluye de manera enunciativa más no limitativa, a (i) actividades académicas, (ii) reuniones convocadas por el Director, Profesores o Departamento psicológico, (iii) Actividades de recreación, (iv) capacitaciones y/o reuniones individuales que realizará el Colegio para los Padres de Familia con la finalidad de conocer y manejar la Plataforma Virtual y otros. El incumplimiento será registrado en el sistema institucional.`;
  const C6_P13A = `6.13	En caso de que, por disposición del Ministerio de Educación u otra autoridad educativa competente, se requiera el ingreso a la modalidad semipresencial, el PADRE O MADRE DE FAMILIA reconoce que, para el acceso adecuado a la plataforma virtual, será necesario contar con un equipo informático (computadora o laptop) con audio, video y micrófono operativos, así como conexión a internet que cumpla condiciones técnicas mínimas:`;
  const C6_P13B = `Computadoras o laptops: Intel core 2 duo, 4GB de memoria RAM.`;
  const C6_P13C = `Velocidad de internet en modo descarga de 20Mbps.`;
  const C6_P14A = `6.14	Que el incumplimiento de cualquiera de estas declaraciones por parte del PADRE O MADRE DE FAMILIA facultará al Colegio a adoptar las medidas internas que correspondan, de manera proporcional y conforme a su normativa interna, así como, de ser el caso y conforme a la legislación vigente, a poner los hechos en conocimiento de las autoridades competentes.`;

  const C7_P1A = `La vigencia del Contrato se sujeta al calendario escolar dispuesto para este año para las tres modalidades, el mismo que se inicia el lunes 9 de marzo del 2026 y culmina el viernes 18 de diciembre del 2026.`;
  const C8_P1A = `El PADRE O MADRE DE FAMILIA podrá controlar o verificar, a su propio costo y cargo, la ejecución de los Servicios, comprometiéndose a tratar en primera instancia y de manera directa cualquier deficiencia, queja o reclamo ante la sede del Colegio, a efectos de encontrar la mejor solución posible.`;
  const C9_P1A = `El Colegio brindará los siguientes servicios de apoyo al Estudiante:`;
  const C9_P2A = `9.1 Servicio de Tópico de Primeros Auxilios`;
  const C9_P3A = `9.2 Servicio de Psicología Educativa`;
  const C9_P4A = `9.3 Servicio de Área Recreativa y/o Campo Deportivo`;
  const C10_P1A = `En el caso que una o varias cláusulas contenidas en el Contrato puedan ser consideradas incompatibles y/o inválida con alguna disposición legal, vigente o futura, dicha incompatibilidad y/o invalidez no afectará a las restantes, las que mantendrán su plena vigencia debiéndose interpretar aquellas cláusulas incompatibles o inválidas como inexistentes.`;

  // --- RENDERIZADO ---

  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(
      'CLÁUSULA SEXTA. - OBLIGACIONES Y DECLARACIONES DEL PADRE O MADRE DE FAMILIA',
      { underline: true },
    );
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_Intro}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P1A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P2A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P3A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P3B}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P4A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P5A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P6A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P7A} ${C6_P7B}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P8A}`, { width: TEXT_WIDTH, align: 'justify' });

  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P9A}`, { width: TEXT_WIDTH, align: 'justify' });

  const tableData = [
    { col1: 'INICIAL', col2: 'PRIMARIA(*)', col3: 'SECUNDARIA(**)' },
    { col1: '22 Alumnos', col2: '30 Alumnos', col3: '30 Alumnos' },
  ];
  let tableTop = doc.y;
  generateTable(doc, tableData, tableTop, [100, 100, 100]);
  tableTop += 10;
  doc
    .fontSize(7)
    .text(
      '(*) En el primer grado de primaria el número máximo será de 32.',
      50,
      doc.y + 5,
      { width: TEXT_WIDTH, align: 'left' },
    );
  doc
    .fontSize(7)
    .text(
      '(**) En el primer año de secundaria el número máximo será de 32.',
      50,
      doc.y + 5,
      { width: TEXT_WIDTH, align: 'left' },
    );

  doc.moveDown();
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P10A} ${C6_P10B}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P11A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P12A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P13A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P13B}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P13C}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C6_P14A}`, { width: TEXT_WIDTH, align: 'justify' });

  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA SÉPTIMA. - DEL PLAZO DE EJECUCIÓN DEL SERVICIO', {
      underline: true,
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C7_P1A}`, { width: TEXT_WIDTH, align: 'justify' });

  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA OCTAVA. - DE LA SUPERVISIÓN DE LOS SERVICIOS', {
      underline: true,
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C8_P1A}`, { width: TEXT_WIDTH, align: 'justify' });

  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA NOVENA. - DE LOS SERVICIOS DE APOYO AL ESTUDIANTE', {
      underline: true,
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C9_P1A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C9_P2A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C9_P3A}`, { width: TEXT_WIDTH, align: 'justify' });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C9_P4A}`, { width: TEXT_WIDTH, align: 'justify' });

  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CLÁUSULA DÉCIMA. - INCOMPATIBILIDAD DE CLÁUSULAS', {
      underline: true,
    });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C10_P1A}`, { width: TEXT_WIDTH, align: 'justify' });
}

export function generateTable(
  doc: PDFKit.PDFDocument,
  data: any[],
  y: number,
  columnWidths: number[],
) {
  const rowHeight = 15;
  const startX = 50;
  y += rowHeight;

  data.forEach((row) => {
    // Prevent bad breaks
    if (y + rowHeight > doc.page.height - 50) {
      doc.addPage();
      y = 50;
    }
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col1, startX + 5, y + 5, {
        width: columnWidths[0] - 4,
        align: 'left',
        lineBreak: false,
      });
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col2, startX + columnWidths[0] + 5, y + 5, {
        width: columnWidths[1] - 4,
        align: 'left',
        lineBreak: false,
      });
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(row.col3, startX + columnWidths[0] + columnWidths[1] + 5, y + 5, {
        width: columnWidths[2] - 4,
        align: 'left',
        lineBreak: false,
      });

    drawRowLines(doc, y, columnWidths, rowHeight);
    y += rowHeight;
  });
  doc.y = y;
}

export function drawRowLines(
  doc: PDFKit.PDFDocument,
  y: number,
  columnWidths: number[],
  rowHeight: number,
) {
  doc.lineWidth(0.5);
  doc.strokeColor('#000');
  const startX = 50;
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);

  doc
    .moveTo(startX, y)
    .lineTo(startX + totalWidth, y)
    .stroke();
  let xPos = startX;
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
    .moveTo(startX, y + rowHeight)
    .lineTo(startX + totalWidth, y + rowHeight)
    .stroke();
}
