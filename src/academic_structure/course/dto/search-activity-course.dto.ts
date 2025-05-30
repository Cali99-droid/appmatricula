import { IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class SearchActivityCourseDto {
  // @IsOptional()
  // @IsPositive()
  // @IsNumber()
  // @Min(1)

  @IsOptional()
  @ExistId({ tableName: 'level' })
  levelId?: number;

  @ExistId({ tableName: 'campus' })
  campusId?: number;

  @IsOptional()
  @ExistId({ tableName: 'grade' })
  gradeId?: number;

  @IsOptional()
  @ExistId({ tableName: 'phase' })
  phaseId?: number;
}
