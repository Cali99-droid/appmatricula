// import { PartialType } from '@nestjs/swagger';
// import { CreateAttendanceDto } from './create-attendance.dto';

// export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}
import { ApiProperty } from '@nestjs/swagger';
import { ConditionAttendance } from '../enum/condition.enum';
import { IsEnum } from 'class-validator';

export class UpdateAttendanceDto {
  @ApiProperty({
    description: 'Condition of attedance',
    nullable: false,
    example: '1',
    enum: ConditionAttendance,
  })
  @IsEnum(ConditionAttendance, {
    message: 'type of attendance, must be P, T or F',
  })
  condition: ConditionAttendance;
}
