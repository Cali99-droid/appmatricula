import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNumber,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateDayOfWeekDto {
  @ApiProperty({
    description: 'Name of day of week',
    maxLength: 2,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2)
  name: string;

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
