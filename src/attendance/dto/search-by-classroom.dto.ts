import { IsDateString, IsEnum } from 'class-validator';

import { ExistId } from 'src/common/validation/exist-id';
import { TypeSchedule } from '../enum/type-schedule.enum';
import { isDateBeforeOrEqual } from 'src/common/decorators/is-date-before-eq.decorator';

export class SearchByClassroomDto {
  @ExistId({ tableName: 'activity_classroom' })
  activityClassroomId?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @isDateBeforeOrEqual('startDate', {
    message: 'endDate must be after startDate',
  })
  endDate: string;

  @IsEnum(TypeSchedule, {
    message: 'type shift value must be some values: [G, I] ',
  })
  typeSchedule: TypeSchedule;
}
