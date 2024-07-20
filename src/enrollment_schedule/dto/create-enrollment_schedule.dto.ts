import { IsDateString, IsEnum, MinLength, IsString } from 'class-validator';
import { IsDateBefore } from 'src/common/decorators/is-date-before.decorator';
import { ApiProperty } from '@nestjs/swagger';

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
    example: 'R',
    description:
      'tipo de cronograma, puede ser "R"(ratification), "O"(matricula de estudiantes antiguos), N (matricula de estudiantes nuevos)',
    nullable: false,
    enum: TypeEnrollmentSchedule,
  })
  @IsEnum(TypeEnrollmentSchedule, {
    message: 'type value must be some values: [R, N, O] ',
  })
  type: TypeEnrollmentSchedule;

  // @ApiProperty({
  //   example: 1,
  //   description: 'id of the year',
  //   nullable: false,
  // })
  // @IsNumber()
  // @ExistId({ tableName: 'year' })
  // yearId: number;
}
