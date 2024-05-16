import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Day } from 'src/common/enum/day.enum';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateDayOfWeekDto {
  @ApiProperty({
    description: 'Name of day of week',
    nullable: false,
    example: '1',
    enum: Day,
  })
  @IsEnum(Day, {
    message: 'day  value must be some values of [0,1...] ',
  })
  name: Day;

  @ApiProperty({
    example: true,
    description: 'optional, true or false',
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'year' })
  yearId: number;
}
