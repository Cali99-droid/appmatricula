import { ApiProperty } from '@nestjs/swagger';
import {
  Validate,
  IsString,
  MinLength,
  Matches,
  IsNumber,
} from 'class-validator';
// import { IsDateBefore } from 'src/common/decorators/is-date-before.decorator';
import { IsEndTimeAfterStartTimeConstraint } from 'src/common/decorators/is-time-before.decorator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateSchoolShiftDto {
  @ApiProperty({
    description: 'Name of the school-shift (unique)',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'start of the school shift',
    nullable: false,
  })
  @Matches(/^(0?[0-9]|1[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/)
  startTime: string;

  @ApiProperty({
    description: 'End of the year',
    nullable: false,
  })
  @Matches(/^(0?[0-9]|1[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/)
  @Validate(IsEndTimeAfterStartTimeConstraint, ['startTime'])
  // @IsDateBefore('startDate', { message: 'endDate must be after startDate' })
  endTime: string;
  @ApiProperty({
    example: 1,
    description: 'id of the campus',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'campus' })
  campusId: number;
  @ApiProperty({
    example: 1,
    description: 'id of the level',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'level' })
  levelId: number;
}
