import * as PDFDocument from 'pdfkit';
export function addContractHeader(doc: InstanceType<typeof PDFDocument>) {
  //   doc.registerFont('Arial', path.join(__dirname, '..', 'fonts', 'arial.ttf'));
  //   doc.registerFont(
  //     'Arial-Bold',
  //     path.join(__dirname, '..', 'fonts', 'arial-bold.ttf'),
  //   );
  //   doc.registerFont('Arial Font', 'fonts/Arial.ttc', 'Arial-Bold');
  // VARIABLES
  const numContra = '123';
  const nombre = 'Adnner Esperilla Ruiz';
  const dni = '72277106';
  const domicilio = 'San Borja #123';
  const distrito = 'San Borja';
  const provincia = 'Lima';
  const departamento = 'Lima';
  //TEXTO DEL PRIMER PARRAFO
  const P1A =
    'con RUC N° 20531084587, con domicilio en Jr. Huaylas N° 220 interior 224, Distrito';
  const P1B =
    'de Independencia, Provincia de Huaraz, Departamento de Ancash, debidamente representada por el señor José Isidro Pineda';
  const P1C =
    'Sifuentes, identificado con DNI 07524459 en su calidad de DIRECTOR EJECUTIVO con poderes inscritos en la Partida';
  const P1D =
    'Electrónica N° 11064876 del Registro de Personas Jurídicas de Huaraz, a quien en lo sucesivo se le denominará la “ASOCIACIÓN”.';
  //TEXTO DEL SEGUNDO PARRAFO
  const P2A = `Y de la otra parte:`;
  const P2B = `identificado con DNI Nro.`;
  const P2C = `con domicilio en`;
  const P2D = 'Distrito de';
  const P2E = 'Provincia de';
  const P2F = 'DepartamentO de';
  const P2G =
    'en su calidad de Padre o Madre del menor, a quien en lo sucesivo se le denominará';
  const P2H = '“PADRE O MADRE DE FAMILIA”.';
  //TEXTO DE CLAUSULA PRIMERA
  const C1_P1A = `1.1	La Asociación Educativa Luz y Ciencia es propietaria del Colegio Albert Einstein – Huaraz,`;
  const C1_P1B = `es una asociación sin fines de lucro dedicada a la gestión, ejecución y proyección de servicios educativos.`;
  const C1_P2A = `1.2	El presente Contrato se celebra en virtud de la oferta educativa brindada por la ASOCIACIÓN y la decisión de libre`;
  const C1_P2B = `voluntad del PADRE O MADRE DE FAMILIA, de contratar los servicios educativos en el modo y forma contemplados `;
  const C1_P2C = `en el presente contrato, en base a información clara, relevante y suficiente que se explican en el presente documento y`;
  const C1_P2D = `en información obrante en el portal institucional de la ASOCIACIÓN (http://www.ae.edu.pe/).`;
  const C1_P3A = `1.3	La ASOCIACIÓN ha desarrollado su plan de estudio 2024 en concordancia con la normatividad vigente y su adaptación`;
  const C1_P3B = `a la posibilidad de una educación semipresencial. La elaboración del nuevo plan de estudio; así como la implementación`;
  const C1_P3C = `en las diferentes modalidades han sido llevadas a cabo mediante la asesoría de instituciones y expertos en pedagogía`;
  const C1_P3D = `de primer nivel, así como una adecuada capacitación de los docentes y personal administrativo del Colegio y será`;
  const C1_P3E = `aplicada en cumplimiento de las disposiciones legales vigentes.`;
  const C1_P4A = `1.4	La modalidad de estudio PRESENCIAL O SEMIPRESENCIAL que adopte el COLEGIO por periodo, será respetando`;
  const C1_P4B = `los lineamientos de la autoridad educativas (MINEDU, UGEL, DREA, ETC) y de salud (MINSA), esta será oportunamente`;
  const C1_P4C = `comunicada al PADRE O MADRE DE FAMILIA, el cual se compromete a respetarla y cumplirla.`;
  //TEXTO DE CLAUSULA SEGUNDA
  const C2_P1A = `2.1	Por el presente Contrato La ASOCIACIÓN se obliga a prestar a favor del niño, niña o adolescente (en adelante el`;
  const C2_P1B = `“ALUMNO”) sus servicios de educación en el nivel inicial, primaria, secundaria, de acuerdo con el nivel educativo del`;
  const C2_P1C = `ALUMNO, en adelante los “SERVICIOS”.`;
  const C2_P2A = `2.2	La modalidad PRESENCIAL o SEMI PRESENCIAL se desarrollarán cumpliendo los protocolos de seguridad y salud`;
  const C2_P2B = `que la autoridad sanitaria establezca para los colegios a nivel nacional y, siempre y cuando, exista dicha disposición.`;
  const C2_P3A = `2.3	Los Servicios serán brindados de acuerdo con el plan de estudio de la ASOCIACIÓN el mismo que ha sido informado a`;
  const C2_P3B = `los Padres o Madres de Familia en su oportunidad, declarando el PADRE O MADRE DE FAMILIA mediante la presente conocer en su integridad.`;
  const C2_P4A = `2.4	El presente contrato y sus cláusulas gozan de plena autonomía respecto de contratos suscritos con fechas anteriores`;
  const C2_P4B = `de parte de la ASOCIACIÓN, sin encontrar ninguna relación de dependencia o vinculación que genere obligaciones en`;
  const C2_P4C = `las actuaciones de la ASOCIACIÓN.`;
  //TEXTO DE CLAUSULA TERCERA
  const C3_P1A = `3.1	El año académico se inicia el lunes 11 de marzo de 2024 y finaliza el viernes 17 de diciembre del 2024, salvo`;
  const C3_P1B = `disposiciones del Ministerio de Educación, de la UGEL HUARAZ o autoridad competente que obligue a modificar lo establecido en el presente numeral.`;
  const C3_P2A = `3.2	Los tres niveles educativos (inicial, primaria y secundaria) están organizados en 4 bimestres. Al finalizar cada periodo`;
  const C3_P2B = `académico los alumnos tendrán un periodo corto de descanso.`;
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('CONTRATO DE PRESTACIÓN DE SERVICIOS EDUCATIVOS', {
      align: 'center',
    });
  doc.moveDown();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`N° ${numContra}-2024-ASELUC-C`, { align: 'center' });
  // PARRAFO 1
  doc.moveDown(2);
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
  // PARRAFO 2
  doc.moveDown();
  doc.font('Helvetica').fontSize(9).text(`${P2A} `, { continued: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${nombre} `, { continued: true });
  doc.font('Helvetica').fontSize(9).text(`${P2B} `, { continued: true });
  doc.font('Helvetica-Bold').fontSize(9).text(`${dni} `, { continued: true });
  doc.font('Helvetica').fontSize(9).text(`${P2C} `, { continued: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${domicilio}, `, { continued: true });
  doc.font('Helvetica').fontSize(9).text(`${P2D} `, { continued: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${distrito}, `, { continued: true });
  doc.font('Helvetica').fontSize(9).text(`${P2E} `, { continued: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${provincia}, `, { continued: true });
  doc.font('Helvetica').fontSize(9).text(`${P2F} `, { continued: true });
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${departamento}, `, { continued: true });
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
  // CLAUSULA SEGUNDA
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
}
