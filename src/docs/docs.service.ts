import { Injectable, Logger } from '@nestjs/common';

import * as ExcelJS from 'exceljs';
@Injectable()
export class DocsService {
  private readonly logger = new Logger('DOCS');
  async generateAcademicRecordExcelByLevelAndSection(
    reportsByClassroom,
  ): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Académico General'); // Una única hoja

    let currentRowOffset = 0; // Para mantener el seguimiento de la fila actual en la hoja

    // --- Título general del reporte ---
    // Usamos la información del primer reporte disponible para el título general.
    const firstReport = reportsByClassroom[0];
    const reportTitle = firstReport
      ? `Reporte Académico Nivel ${firstReport.classroom.level} - Bimestre ${firstReport.bimestre.name}`
      : 'Reporte Académico';

    worksheet.mergeCells(`A${currentRowOffset + 1}:C${currentRowOffset + 1}`);
    worksheet.getCell(`A${currentRowOffset + 1}`).value = reportTitle;
    worksheet.getCell(`A${currentRowOffset + 1}`).font = {
      bold: true,
      size: 16,
    };
    worksheet.getCell(`A${currentRowOffset + 1}`).alignment = {
      horizontal: 'center',
    };
    currentRowOffset += 2; // Espacio después del título

    // --- Preparación y adición de ENCABEZADOS ÚNICOS (Áreas y Competencias) ---
    // Tomamos los encabezados del primer reporte para definirlos una sola vez
    const sampleReport = reportsByClassroom[0];

    // Si no hay reportes, salimos o manejamos el error
    if (!sampleReport) {
      this.logger.warn(
        'No academic reports found for the given level and bimester.',
      );
      return await workbook.xlsx.writeBuffer();
    }

    const initialFixedColumns = 3; // 'Grado/Sección', 'Código', 'Estudiante'

    const areaHeaderRowValues = [];
    const competencyHeaderRowValues = [];
    const allCompetenciesInColumnOrder = []; // Esto se usa para rellenar datos de estudiantes
    const areaMergeCellsInfo = []; // DECLARADO AQUÍ PARA EVITAR EL ERROR DE REFERENCIA

    let currentColumnIndexForMerge = initialFixedColumns + 1; // La primera columna para áreas/competencias es la 4 (D)

    // Rellenar las columnas fijas iniciales
    areaHeaderRowValues.push(''); // Placeholder for 'Grado/Sección'
    areaHeaderRowValues.push(''); // Placeholder for 'Código'
    areaHeaderRowValues.push(''); // Placeholder for 'Estudiante'

    competencyHeaderRowValues.push('Código');
    competencyHeaderRowValues.push('Estudiante');
    competencyHeaderRowValues.push('Grado/Sección');

    // Construir los encabezados por área y competencia basados en el sampleReport
    sampleReport.areas
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((area) => {
        const sortedCompetencies = area.competencies.sort(
          (a, b) => a.order - b.order,
        );
        const numCompetenciesInArea = sortedCompetencies.length;

        if (numCompetenciesInArea > 0) {
          areaHeaderRowValues.push(area.name);
          for (let i = 0; i < numCompetenciesInArea - 1; i++) {
            areaHeaderRowValues.push('');
          }

          sortedCompetencies.forEach((comp) => {
            competencyHeaderRowValues.push(`C${comp.order}`);
            allCompetenciesInColumnOrder.push(comp); // Populating this is correct for student data later
          });

          const areaEndCol =
            currentColumnIndexForMerge + numCompetenciesInArea - 1;
          areaMergeCellsInfo.push({
            // AHORA areaMergeCellsInfo está correctamente declarado
            startCol: currentColumnIndexForMerge,
            endCol: areaEndCol,
          });
          currentColumnIndexForMerge = areaEndCol + 1;
        }
      });

    // Asegurarse de que las filas de encabezado tienen la misma longitud
    const maxHeaderLength = Math.max(
      areaHeaderRowValues.length,
      competencyHeaderRowValues.length,
    );
    while (areaHeaderRowValues.length < maxHeaderLength) {
      areaHeaderRowValues.push('');
    }
    while (competencyHeaderRowValues.length < maxHeaderLength) {
      competencyHeaderRowValues.push('');
    }

    // Añadir las filas de encabezado a la hoja
    const areaHeaderRow = worksheet.addRow(areaHeaderRowValues);
    const areaHeaderRowNumber = areaHeaderRow.number;
    currentRowOffset = areaHeaderRowNumber;

    const competencyHeaderRow = worksheet.addRow(competencyHeaderRowValues);
    const competencyHeaderRowNumber = competencyHeaderRow.number;
    currentRowOffset = competencyHeaderRowNumber;

    // Estilos para las filas de encabezado
    areaHeaderRow.font = { bold: true };
    competencyHeaderRow.font = { bold: true };

    competencyHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Fusionar celdas para los nombres de las áreas (areaMergeCellsInfo ya está poblado)
    areaMergeCellsInfo.forEach((mergeInfo) => {
      worksheet.mergeCells(
        areaHeaderRowNumber,
        mergeInfo.startCol,
        areaHeaderRowNumber,
        mergeInfo.endCol,
      );
      worksheet.getCell(areaHeaderRowNumber, mergeInfo.startCol).alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
    });

    // Asegurar anchos de columna mínimos explícitos para las cabeceras de competencias
    for (
      let i = initialFixedColumns + 1;
      i <= competencyHeaderRowValues.length;
      i++
    ) {
      const column = worksheet.getColumn(i);
      if (!column.width || column.width < 8) {
        column.width = 8;
      }
    }

    // --- Iterar sobre TODOS los reportes para añadir los DATOS de los estudiantes ---
    reportsByClassroom
      .sort((a, b) => {
        const gradeA = a.classroom.name.split(' ')[0];
        const gradeB = b.classroom.name.split(' ')[0];
        if (gradeA !== gradeB) return gradeA.localeCompare(gradeB);
        return a.classroom.name.localeCompare(b.classroom.name);
      })
      .forEach((report) => {
        const gradeParts = report.classroom.name.split(' ');
        const gradeName =
          gradeParts.length > 1 ? gradeParts[0] : report.classroom.name;
        const classroomSection = gradeParts.slice(1).join(' ').trim();

        report.students.forEach((student) => {
          const studentRow = [];

          studentRow.push(student.code);
          studentRow.push(student.name);
          studentRow.push(`${gradeName} - ${classroomSection}`);
          const studentQualificationsMap = new Map(
            student.qualifications.map((q) => [q.competenciaId, q.valor]),
          );

          allCompetenciesInColumnOrder.forEach((comp) => {
            studentRow.push(studentQualificationsMap.get(comp.id) || '');
          });

          worksheet.addRow(studentRow);
          currentRowOffset++;
        });
      });

    // --- Estilos y Auto-ajuste de columnas para TODA LA HOJA (Aplicado una vez al final) ---
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        const columnLength = cellValue.length;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width =
        maxLength < 5 ? (column.width < 8 ? 8 : column.width) : maxLength + 2;
    });

    // Estilo para los bordes de la tabla (aplicado a toda la hoja)
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        if (cell.value !== undefined || cell.isMerged) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
