import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';
import { ValueGrade } from '../enum/value-grade.enum';
import { Type } from 'class-transformer';

export class CreateAcademicRecordDto {
  @IsInt()
  @ExistId({ tableName: 'academic_assignment' })
  academicAssignmentId: number;

  //   @IsInt()
  //   @ExistId({ tableName: 'user' })
  //   userId: number;

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
  @ExistId({ tableName: 'competency' })
  competencyId: number;

  @IsEnum(ValueGrade)
  value: ValueGrade;

  @IsOptional()
  @IsString()
  comentario?: string;
}
