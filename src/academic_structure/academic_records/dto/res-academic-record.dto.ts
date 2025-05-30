import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CompetencyDto {
  @ApiProperty({ example: 26 })
  id: number;

  @ApiProperty({ example: 'RESUELVE PROBLEMAS DE CANTIDAD' })
  name: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: 2 })
  academicRecordId: number;

  @ApiProperty({ example: 'A' })
  value: string;
}

export class StudentCompetencyDto {
  @ApiProperty({ example: '25134487800020', nullable: true })
  studentPhoto: string | null;

  @ApiProperty({ example: 2237 })
  studentId: number;

  @ApiProperty({ example: 'ARIAS SANCHEZ LAILA ZHARICK' })
  student: string;

  @ApiProperty({ type: [CompetencyDto] })
  competencies: CompetencyDto[];
}

export class AreaDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'MATEMÁTICA' })
  name: string;
}

export class CourseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ALGEBRA' })
  name: string;
}

export class AcademicAssignmentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'COMPLETE_AREA' })
  type: string;

  @ApiProperty({ type: AreaDto })
  area: AreaDto;

  @ApiProperty({ type: CourseDto })
  @IsOptional()
  course?: CourseDto;
}

export class AcademicRecordsResponseDto {
  @ApiProperty({ type: AcademicAssignmentDto })
  academicAssignment: AcademicAssignmentDto;

  @ApiProperty({ type: [StudentCompetencyDto] })
  students: StudentCompetencyDto[];
}
