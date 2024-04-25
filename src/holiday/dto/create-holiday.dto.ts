import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNumber,
  IsDateString,
  IsISO8601,
  Matches,
} from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateHolidayDto {
  @ApiProperty({
    description: 'Description of the grade',
    example: 'Dia de la madre',
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  description: string;

  @ApiProperty({
    description: 'Date of the holiday',
    example: '2024-03-01',
    nullable: false,
  })
  @IsISO8601()
  @IsDateString()
  @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, {
    message: 'The date format must be YYYY-MM-DD',
  })
  date: Date;

  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'year' })
  yearId: number;
}
