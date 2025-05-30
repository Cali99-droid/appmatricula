import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';
import { ValueGrade } from '../enum/value-grade.enum';

export class UpdateAcademicRecordDto {
  @IsInt()
  // @ExistId({ tableName: 'academic_assignment' })
  academicAssignmentId: number;

  @IsInt()
  @ExistId({ tableName: 'bimester' })
  bimesterId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentRecord)
  records: StudentRecord[];
}

class StudentRecord {
  @IsInt()
  @ExistId({ tableName: 'student' })
  studentId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetencyRecordDto)
  competencies: CompetencyRecordDto[];
}

class CompetencyRecordDto {
  @IsInt()
  @ExistId({ tableName: 'academic_record' })
  @IsOptional()
  academicRecordId?: number; // Opcional para nuevas calificaciones

  @IsInt()
  @ExistId({ tableName: 'competency' })
  competencyId: number;

  @IsEnum(ValueGrade)
  value: ValueGrade;
}
