import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';
import { ValueGrade } from '../enum/value-grade.enum';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAcademicRecordDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la asignación académica (`academicAssignment`).',
    nullable: false,
  })
  @IsInt()
  @ExistId({ tableName: 'academic_assignment' })
  academicAssignmentId: number;

  @ApiProperty({
    example: 5,
    description: 'ID del bimestre al cual pertenecen las calificaciones.',
  })
  @IsInt()
  @ExistId({ tableName: 'bimester' })
  bimesterId: number;

  @ApiProperty({
    type: () => [StudentRecordDto],
    description:
      'Lista de registros por estudiante, con sus competencias y calificaciones.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentRecordDto)
  records: StudentRecordDto[];
}

export class StudentRecordDto {
  @ApiProperty({
    example: 2420,
    description: 'ID del estudiante.',
  })
  @IsInt()
  @ExistId({ tableName: 'student' })
  studentId: number;

  @ApiProperty({
    type: () => [CompetencyRecordDto],
    description: 'Competencias evaluadas para el estudiante.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetencyRecordDto)
  competencies: CompetencyRecordDto[];
}

export class CompetencyRecordDto {
  @ApiProperty({
    example: 26,
    description: 'ID de la competencia evaluada.',
  })
  @IsInt()
  @ExistId({ tableName: 'competency' })
  competencyId: number;

  @ApiProperty({
    example: 19,
    description:
      'ID del registro académico si ya existe. Puede omitirse si es nuevo.',
    required: false,
  })
  @IsInt()
  @IsOptional()
  academicRecordId?: number;

  @ApiProperty({
    example: 'A',
    enum: ValueGrade,
    description: 'Valor asignado a la competencia (ej: A, B, C, AD, etc).',
  })
  @IsEnum(ValueGrade)
  value: ValueGrade;
}
