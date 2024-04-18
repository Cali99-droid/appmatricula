import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNumber, IsDateString } from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty({
    description: 'Description of the grade',
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  description: string;

  @ApiProperty({
    description: 'Date of the holiday',
    nullable: false,
  })
  @IsDateString()
  date: Date;

  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  yearId: number;
}
