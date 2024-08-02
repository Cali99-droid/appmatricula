import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TypeEnrollmentSchedule } from '../enum/type-enrollment_schedule';
import { ExistId } from 'src/common/validation/exist-id';

export class FindCronogramasDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(TypeEnrollmentSchedule)
  type?: TypeEnrollmentSchedule;

  @IsOptional()
  @IsDateString()
  currentDate?: string;

  @IsOptional()
  @IsString()
  @ExistId({ tableName: 'year' })
  yearId?: string;
}
