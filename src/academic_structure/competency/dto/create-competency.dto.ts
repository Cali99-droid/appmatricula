import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateCompetencyDto {
  @ApiProperty({
    description: 'Name of the competency',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 1,
    description: 'id of the course',
    nullable: false,
  })
  @IsNumber()
  courseId?: number;

  @ApiProperty({
    example: 1,
    description: 'id of the course',
    nullable: false,
  })
  @IsNumber()
  areaId?: number;

  @ApiProperty({
    example: 1,
    description: 'Order from area',
    nullable: false,
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    example: 'true',
    description: 'status of year, must be true or false',
    nullable: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
