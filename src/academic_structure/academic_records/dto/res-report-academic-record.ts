import { ApiProperty } from '@nestjs/swagger';

export class ResReportAcademicRecord {
  @ApiProperty({
    type: 'object',
    description: 'Información detallada del aula',
    properties: {
      id: { type: 'number', example: 1 },
      nombre: { type: 'string', example: '3ero A' },
      grado: { type: 'string', example: '3ero' },
      nivel: { type: 'string', example: 'Secundaria' },
    },
  })
  classroom: {
    id: number;
    name: string;
    level: string;
  };
  @ApiProperty({
    type: 'object',
    description: 'Información del bimestre académico',
    properties: {
      id: { type: 'number', example: 2 },
      nombre: { type: 'string', example: 'Segundo Bimestre' },
      orden: { type: 'number', example: 2 },
    },
  })
  bimestre: {
    id: number;
    name: string;
  };
  @ApiProperty({
    type: 'array',
    description: 'Listado de áreas académicas con sus competencias',
    items: {
      $ref: '#/components/schemas/AreaReporteDto',
    },
  })
  areas: AreaReporteDto[];

  @ApiProperty({
    type: 'array',
    description: 'Listado de estudiantes con sus calificaciones',
    items: {
      $ref: '#/components/schemas/EstudianteReporteDto',
    },
  })
  students: StundetReportDto[];
}

class AreaReporteDto {
  @ApiProperty({
    type: 'number',
    description: 'ID único del área académica',
    example: 1,
  })
  id: number;
  @ApiProperty({
    type: 'string',
    description: 'Nombre del área académica',
    example: 'Matemática',
  })
  name: string;
  @ApiProperty({
    type: 'array',
    description: 'Competencias asociadas al área',
    items: {
      $ref: '#/components/schemas/CompetenciaReporteDto',
    },
  })
  competencies: CompetencyReportDto[];
}

class CompetencyReportDto {
  @ApiProperty({
    type: 'number',
    description: 'ID único de la competencia',
    example: 1,
  })
  id: number;
  @ApiProperty({
    type: 'string',
    description: 'Nombre de la competencia',
    example: 'Resuelve problemas de cantidad',
  })
  name: string;
}

export class StundetReportDto {
  @ApiProperty({
    type: 'number',
    description: 'ID único del estudiante',
    example: 101,
  })
  id: number;

  @ApiProperty({
    type: 'string',
    description: 'Código único del estudiante',
    example: '2023-101',
  })
  code: string;

  @ApiProperty({
    type: 'string',
    description: 'Nombre completo del estudiante',
    example: 'Pérez García Juan',
  })
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'URL de la foto del estudiante',
    required: false,
    example: 'foto101.jpg',
  })
  photo?: string;

  @ApiProperty({
    type: 'array',
    description: 'Notas del estudiante por competencia',
    items: {
      $ref: '#/components/schemas/NotaCompetenciaDto',
    },
  })
  qualifications: QualificationCompetencyDto[]; // Notas por competencia
}

class QualificationCompetencyDto {
  @ApiProperty({
    type: 'number',
    description: 'ID de la competencia a la que pertenece la nota',
    example: 1,
  })
  competencyId: number;

  @ApiProperty({
    type: 'string',
    description: 'Valor de la nota (puede ser letra o número)',
    example: 'A',
    enum: ['A', 'B', 'C', 'D', ''],
  })
  value: string; // Puede ser numérico o letra (A, B, C)
}
