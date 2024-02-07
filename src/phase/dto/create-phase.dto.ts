import { IsDateString, IsEnum, IsNumber } from 'class-validator';
import { TypePhase } from '../enum/type-phase.enum';
// import { Type } from 'class-transformer';
import { IsDateBefore } from 'src/common/decorators/is-date-before.decorator';

export class CreatePhaseDto {
  @IsDateString()
  // @Type(() => Date) // Asegura que la entrada se transforme en un objeto Date
  startDate: Date;

  @IsDateString()
  // @Type(() => Date) // Asegura que la entrada se transforme en un objeto Date
  @IsDateBefore('startDate', { message: 'endDate must be after startDate' })
  endDate: Date;

  @IsEnum(TypePhase, {
    message: 'type value must be some values: [REGULAR, RECUPERACION] ',
  })
  type: TypePhase;

  @IsNumber()
  yearId: number;
}
