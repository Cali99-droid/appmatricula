import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, MinLength } from 'class-validator';

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
    example: 'true',
    description: 'status of year, must be true or false',
    nullable: false,
  })
  @IsBoolean()
  status?: boolean;
}
