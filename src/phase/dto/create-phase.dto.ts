import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { TypePhase } from '../enum/type-phase.enum';
import { IsDateBefore } from 'src/common/decorators/is-date-before.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { ExistId } from 'src/common/validation/exist-id';

export class CreatePhaseDto {
  @ApiProperty({
    description: 'Start of the phase',
    nullable: false,
  })
  @IsDateString()
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
    enum: TypePhase,
  })
  @IsEnum(TypePhase, {
    message: 'type value must be some values: [REGULAR, RECUPERACION] ',
  })
  type: TypePhase;

  @ApiProperty({
    example: 'true',
    description: 'status of phase, must be true or false',
    nullable: false,
  })
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  @IsOptional()
  @ExistId({ tableName: 'year' })
  yearId: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'array of classrooms for this phase',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  @ExistId({ tableName: 'classroom', isArray: true })
  classrooms?: number[];
}
