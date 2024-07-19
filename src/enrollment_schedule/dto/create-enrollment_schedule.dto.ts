import {
  IsDateString,
  IsEnum,
  IsNumber,
  MinLength,
  IsString,
} from 'class-validator';
import { IsDateBefore } from 'src/common/decorators/is-date-before.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { ExistId } from 'src/common/validation/exist-id';
import { TypeEnrollmentSchedule } from '../enum/type-enrollment_schedule';

export class CreateEnrollmentScheduleDto {
  @ApiProperty({
    example: 'Matricula para estudiantes',
    description: 'Name of enrollment schedule',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: '2023-11-01',
    description: 'Start of the enrollment schedule',
    nullable: false,
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    example: '2024-01-31',
    description: 'End of the enrollment schedule',
    nullable: false,
  })
  @IsDateString()
  @IsDateBefore('startDate', { message: 'endDate must be after startDate' })
  endDate: Date;

  @ApiProperty({
    example: 'MATRICULA',
    description: 'type of phase, must be MATRICULA or ADMISION',
    nullable: false,
    enum: TypeEnrollmentSchedule,
  })
  @IsEnum(TypeEnrollmentSchedule, {
    message: 'type value must be some values: [MATRICULA, ADMISION] ',
  })
  type: TypeEnrollmentSchedule;

  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'year' })
  yearId: number;
}
