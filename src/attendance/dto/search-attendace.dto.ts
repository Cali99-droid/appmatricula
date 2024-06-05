import { IsDateString, IsEnum, IsOptional, IsUppercase } from 'class-validator';
import { Section } from 'src/activity_classroom/enum/section.enum';
// import { IsDateBefore } from 'src/common/decorators/is-date-before.decorator';
import { ExistId } from 'src/common/validation/exist-id';
import { Shift } from '../enum/shift.enum';

export class SearchAttendanceDto {
  @IsOptional()
  // @IsPositive()
  // @IsNumber()
  // @Min(1)
  @ExistId({ tableName: 'year' })
  yearId: string;

  @IsOptional()
  // @IsPositive()
  // @IsNumber()
  //@Min(1)
  @ExistId({ tableName: 'CampusDetail' })
  campusId?: string;

  @IsOptional()
  @ExistId({ tableName: 'level' })
  levelId?: string;

  @IsOptional()
  @ExistId({ tableName: 'grade' })
  gradeId?: string;

  @IsUppercase()
  @IsEnum(Section, {
    message: 'type value must be some values of alphabet ',
  })
  @IsOptional()
  section?: Section;

  @IsOptional()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  // @IsDateBefore('startDate', { message: 'endDate must be after startDate' })
  endDate: string;

  @IsOptional()
  condition: string;

  @IsOptional()
  full_name: string;

  @IsEnum(Shift, {
    message: 'type value must Morning and Afternoon ',
  })
  @IsOptional()
  shift?: Shift;
}
