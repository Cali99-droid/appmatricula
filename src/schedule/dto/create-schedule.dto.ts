import { ApiProperty } from '@nestjs/swagger';
import {
  Validate,
  IsString,
  MinLength,
  Matches,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { IsEndTimeAfterStartTimeConstraint } from 'src/common/decorators/is-time-before.decorator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateScheduleDto {
  @ApiProperty({
    description: 'shift of the schedule',
    nullable: true,
    minLength: 4,
    example: 'Tarde',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  shift: string;

  @ApiProperty({
    description: 'start of the schedule',
    nullable: false,
    example: '14:15:00',
  })
  @Matches(/^(0?[0-9]|1[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/)
  startTime: string;

  @ApiProperty({
    description: 'End of the year',
    nullable: false,
    example: '18:20:00',
  })
  @Matches(/^(0?[0-9]|1[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/)
  @Validate(IsEndTimeAfterStartTimeConstraint, ['startTime'])
  endTime: string;

  @ApiProperty({
    example: 1,
    description: 'id of the activity_classroom',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'activity_classroom' })
  activityClassroomId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the dayOfWeekId',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'day_of_week' })
  dayOfWeekId: number;
}
