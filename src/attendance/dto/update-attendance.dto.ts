import { ApiProperty } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';
import { ConditionAttendance } from '../enum/condition.enum';

export class UpdateAttendanceDto {
  @ApiProperty({
    description: 'condition',
    nullable: false,
  })
  @IsEnum(ConditionAttendance, {
    message:
      'type value must be some values of Early = P, Late = T,Absent = F,',
  })
  condition: ConditionAttendance;
}
