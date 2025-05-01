import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Name of the course',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 1,
    description: 'id of the area',
    nullable: false,
  })
  @IsNumber()
  areaId: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'id of the competency',
    nullable: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  competencyId: [number];

  @ApiProperty({
    example: 'true',
    description: 'status of year, must be true or false',
    nullable: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
