import { IsDateString, IsEnum, IsNumber } from 'class-validator';
import { TypePhase } from '../enum/type-phase.enum';
import { IsDateBefore } from 'src/common/decorators/is-date-before.decorator';

export class CreatePhaseDto {
  @IsDateString()
  // @Type(() => Date)
  startDate: Date;

  @IsDateString()
  @IsDateBefore('startDate', { message: 'endDate must be after startDate' })
  endDate: Date;

  @IsEnum(TypePhase, {
    message: 'type value must be some values: [REGULAR, RECUPERACION] ',
  })
  type: TypePhase;

  @IsNumber()
  yearId: number;
}
