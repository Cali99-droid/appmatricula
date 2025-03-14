import { IsDateString } from 'class-validator';
import { isDateBeforeOrEqual } from 'src/common/decorators/is-date-before-eq.decorator';

export class SearchByDateDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  @isDateBeforeOrEqual('startDate', {
    message: 'endDate must be after startDate',
  })
  endDate: string;
}
