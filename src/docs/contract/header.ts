import * as PDFDocument from 'pdfkit';
import * as path from 'path';
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
  //TEXTO DE PRIMERA CLAUSULA
  const C1_P1A = `1.1	La Asociación Educativa Luz y Ciencia es propietaria del Colegio Albert Einstein – Huaraz,`;
  const C1_P1B = `es una asociación sin fines de lucro dedicada a la gestión, ejecución y proyección de servicios educativos.`;
  const C1_P2 = `identificado con DNI Nro.`;
  const C1_P3 = `con domicilio en`;
  const C1_P4 = `con domicilio en`;

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
    .font('Helvetica')
    .fontSize(9)
    .text('. - ANTECEDENTES.', { underline: false });
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(`${C1_P1A} ${C1_P1B}`, { align: 'justify' });

  row(doc, 90);
  row(doc, 110);
  row(doc, 130);
  row(doc, 150);
  row(doc, 170);
  row(doc, 190);
  row(doc, 210);
  doc.moveDown();
  textInRowFirst(doc, 'Nombre o razón social', 100);
  textInRowFirst(doc, 'RUT', 120);
  textInRowFirst(doc, 'Dirección', 140);
  textInRowFirst(doc, 'Comuna', 160);
  textInRowFirst(doc, 'Ciudad', 180);
  textInRowFirst(doc, 'Telefono', 200);
  textInRowFirst(doc, 'e-mail', 220);
  function textInRowFirst(doc, text, heigth) {
    doc.y = heigth + 500;
    doc.x = 30;
    doc.fillColor('black');
    doc.text(text, {
      paragraphGap: 5,
      indent: 5,
      align: 'justify',
      columns: 1,
    });
    return doc;
  }
  function row(doc, heigth) {
    doc.lineJoin('miter').rect(30, heigth, 500, 20).stroke();
    return doc;
  }
  //   doc
  //     .font('Helvetica')
  //     .fontSize(9)
  //     .text(
  //       `identificado con DNI 07524459 en su calidad de DIRECTOR EJECUTIVO con poderes inscritos en la Partida Electrónica N° 11064876 del Registro de Personas Jurídicas de Huaraz, a quien en lo sucesivo se le denominará la “ASOCIACIÓN”.`,
  //     );
  //   doc.moveDown();
  //   doc
  //     .font('Helvetica')
  //     .fontSize(9)
  //     .text(
  //       `Y de la otra parte: …………………………………………………………… identificado con DNI Nro. ……………………. con domicilio en …………………………………………….……………,
  // Distrito de ……………………………, Provincia de ……………………………, Departamento de ……………………………, en su calidad de Padre o Madre del menor,
  // a quien en lo sucesivo se le denominará “PADRE O MADRE DE FAMILIA”.`,
  //     );
}
