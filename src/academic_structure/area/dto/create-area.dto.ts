import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAreaDto {
  @ApiProperty({
    description: 'Name of the area',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 1,
    description: 'Order from area',
    nullable: false,
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    example: 1,
    description: 'id of the level',
    nullable: false,
  })
  @IsNumber()
  levelId: number;

  @ApiProperty({
    example: 'true',
    description: 'status of year, must be true or false',
    nullable: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
