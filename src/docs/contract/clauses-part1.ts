// import PDFDocument from 'pdfkit';
// import 'pdfkit-table';
// const PDFDocument = require('pdfkit');
import PDFDocument from 'pdfkit';
export function addClausesPart1(doc: InstanceType<typeof PDFDocument>) {
  //TEXTO DE CLAUSULA PRIMERA
  const C1_P1A = `4.1 El PADRE O MADRE DE FAMILIA se compromete a pagar el monto de matrícula para cada uno de los tres niveles,`;
  const C1_P1B = `ascendiente a S/ 300.00 (trescientos y 00/100 soles) y la cuota de ingreso (solo alumnos nuevos) es de S/ 310.00 (trescientos diez y 00/100 soles).`;
  const C1_P2A = `4.2 El PADRE O MADRE DE FAMILIA conoce y acepta el monto anual del servicio educativo, el mismo que es financiado en 10 pensiones mensuales: `;

  const C1_P2C = `en el presente contrato, en base a información clara, relevante y suficiente que se explican en el presente documento y`;
  const C1_P2D = `en información obrante en el portal institucional de la ASOCIACIÓN (http://www.ae.edu.pe/).`;
  const C1_P3A = `1.3 La ASOCIACIÓN ha desarrollado su plan de estudio 2024 en concordancia con la normatividad vigente y su adaptación`;
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
  class MyPDFDocument extends PDFDocument {
    constructor() {
      super();
    }
    // Añadir el método `table` a nuestra clase extendida
    table(table: any, options?: any) {
      // `this` se refiere al documento PDF
      return (this as any).addTable(table, options); // Llama al método table de pdfkit-table
    }
  }
  // // Crear una instancia de MyPDFDocument
  // doc = new MyPDFDocument();
  const doctumento = new MyPDFDocument();
  // }
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
    .text(`${C1_P1A} ${C1_P1B}`, { align: 'justify' });
  const table = {
    headers: ['Grado', 'Costo Anual', 'Pensión Mensual', 'Local'],
    rows: [
      ['INICIAL', 'S/ 3400.00', 'S/ 340.00', 'Local 1 y 2'],
      ['PRIMARIA', 'S/ 3150.00', 'S/ 315.00', 'Local 1'],
      ['', 'S/ 3450.00', 'S/ 345.00', 'Local 2'],
      ['SECUNDARIA', 'S/ 3650.00', 'S/ 365.00', 'Turno Mañana'],
      ['', 'S/ 3250.00', 'S/ 325.00', 'Turno Tarde'],
    ],
  };
  // doctumento.table(table, {
  //   prepareHeader: () => doc.fontSize(10),
  //   prepareRow: (row, i) => doc.fontSize(10),
  // });
  //   doc.moveDown(8);
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .text('CLÁUSULA CUARTA', { continued: true, underline: true });
  //   doc
  //     .font('Helvetica')
  //     .fontSize(9)
  //     .text(`${C1_P2A}  ${C1_P2C} ${C1_P2D}`, { align: 'justify' });
  //   doc
  //     .font('Helvetica')
  //     .fontSize(9)
  //     .text(`${C1_P3A} ${C1_P3B} ${C1_P3C} ${C1_P3D} ${C1_P3E}`, {
  //       align: 'justify',
  //     });
  //   doc
  //     .font('Helvetica')
  //     .fontSize(9)
  //     .text(`${C1_P4A} ${C1_P4B} ${C1_P4C}`, { align: 'justify' });
}
