import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, MinLength } from 'class-validator';
import { IsDateBefore } from 'src/common/decorators/is-date-before.decorator';

export class CreateYearDto {
  @ApiProperty({
    description: 'Name of the year (unique)',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Start of the year',
    nullable: false,
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End of the year',
    nullable: false,
  })
  @IsDateString()
  @IsDateBefore('startDate', { message: 'endDate must be after startDate' })
  endDate: string;
}
