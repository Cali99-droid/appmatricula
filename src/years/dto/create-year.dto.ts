import { IsDateString, IsString, MinLength } from 'class-validator';
import { IsDateBefore } from 'src/common/decorators/is-date-before.decorator';

export class CreateYearDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsDateBefore('startDate', { message: 'endDate must be after startDate' })
  endDate: string;
}
