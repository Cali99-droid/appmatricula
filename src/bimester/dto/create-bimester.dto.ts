import {
  IsDateString,
  IsNumber,
  IsBoolean,
  MinLength,
  IsString,
  Matches,
} from 'class-validator';

import { IsDateBefore } from 'src/common/decorators/is-date-before.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateBimesterDto {
  @ApiProperty({
    description: 'Name of the grade',
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Start of the bimester',
    example: '2024-03-15',
    nullable: false,
  })
  @IsDateString()
  @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, {
    message: 'The date format must be YYYY-MM-DD',
  })
  startDate: Date;

  @ApiProperty({
    description: 'End of the bimester',
    example: '2024-05-15',
    nullable: false,
  })
  @IsDateString()
  @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, {
    message: 'The date format must be YYYY-MM-DD',
  })
  @IsDateBefore('startDate', { message: 'endDate must be after startDate' })
  endDate: Date;

  @ApiProperty({
    example: 'true',
    description: 'status of phase, must be true or false',
    nullable: false,
  })
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    example: 1,
    description: 'id of the phase',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'phase' })
  phaseId: number;
}
