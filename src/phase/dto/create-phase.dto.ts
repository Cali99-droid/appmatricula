import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TypePhase } from '../enum/type-phase.enum';
import { IsDateBefore } from 'src/common/decorators/is-date-before.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePhaseDto {
  @ApiProperty({
    description: 'Start of the phase',
    nullable: false,
  })
  @IsDateString()
  //  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'End of the phase',
    nullable: false,
  })
  @IsDateString()
  @IsDateBefore('startDate', { message: 'endDate must be after startDate' })
  endDate: Date;

  @ApiProperty({
    example: 'REGULAR',
    description: 'type of phase, must be REGULAR OR RECUPERACION',
    nullable: false,
  })
  @IsEnum(TypePhase, {
    message: 'type value must be some values: [REGULAR, RECUPERACION] ',
  })
  type: TypePhase;

  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  @IsOptional()
  yearId: number;
}
