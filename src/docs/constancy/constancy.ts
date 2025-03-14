import * as PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
export function addConstancy(doc: InstanceType<typeof PDFDocument>, data) {
  //TEXTO DEL PRIMER PARRAFO
  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = path.dirname(__filename);
  // const imageHeader = path.join(
  //   __dirname,
  //   '..',
  //   'img',
  //   'constancia-header.png',
  // );
  // const imageFirma = path.join(__dirname, '..', 'img', 'constancia-firma.png');
  // doc.image(imageHeader, 0, 0, { width: doc.page.width, align: 'center' });
  // doc.moveDown(6);
  doc
    .fillColor('#2e559d')
    .fontSize(16)
    .font('Times-Bold')
    .text(`CONSTANCIA DE VACANTE ${data.year}`, {
      align: 'center',
    });
  doc.fillColor('black');
  doc.moveDown(2);
  // Body content
  doc.fontSize(12).font('Times-Roman');
  doc.text(
    'EL QUE AL FINAL SUSCRIBE, DIRECTOR DE LA INSTITUCIÓN EDUCATIVA PRIVADA “ALBERT EINSTEIN” - Huaraz,',
    { align: 'justify' },
  );

  doc.moveDown(1);
  doc.font('Times-Bold').text('HACE CONSTAR:');
  doc.fontSize(12).font('Times-Roman');
  doc.moveDown(1);
  doc.text(
    `Que, el Sr(a) ${data.parent} responsable de la matrícula del alumno(a): ${data.children}, ha reservado una VACANTE, para el referido menor en el Nivel: ${data.level} Grado: ${data.grade}, para el Año Académico ${data.year}.`,
    { align: 'justify' },
  );

  doc.moveDown(1);
  doc.text(
    `Mi representada: I.E.P. “ALBERT EINSTEIN”, reservará la VACANTE hasta la fecha ${data.endVacant}, quién al momento de matricular deberá presentar la documentación completa, que consta de:`,
    { align: 'justify' },
  );
  doc.moveDown(1);
  const listItems = [
    'Ficha Única de Matrícula actualizada a la fecha (Impreso del SIAGIE).',
    'Resolución Directoral de Traslado.',
    'Fotografía de la Tarjeta de Vacunación (hasta el 3° Primaria).',
    'Constancia de no adeudo.',
    'Libreta de notas final con todas las notas aprobatorias.',
  ];

  let yPosition = 350;

  doc.font('Times-Roman').fontSize(12);

  listItems.forEach((item, index) => {
    doc.text(`${index + 1}. ${item}`, 50, yPosition);

    yPosition += 15;
  });
  doc.moveDown(1);
  doc.text(
    'Importante: Al no realizar la matrícula hasta la fecha indicada, ocasionará la PÉRDIDA DE VACANTE, disponiendo mi despacho que dicha VACANTE se le otorgue a otro Padre de Familia que cumpla con los requisitos.',
    { align: 'justify', underline: false },
  );

  doc.moveDown(2);
  doc.text(`Huaraz, ${data.day} de ${data.month} del ${data.year}.`, {
    align: 'right',
  });
}
