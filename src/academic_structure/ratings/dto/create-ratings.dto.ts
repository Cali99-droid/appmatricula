import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRatingsDto {
  @ApiProperty({
    example: 1,
    description: 'id of the student',
    nullable: false,
  })
  @IsNumber()
  studentId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the competency',
    nullable: false,
  })
  @IsOptional()
  @IsNumber()
  competencyId?: number;

  @ApiProperty({
    example: 1,
    description: 'id of the course',
    nullable: false,
  })
  @IsOptional()
  @IsNumber()
  courseId?: number;

  @ApiProperty({
    example: 1,
    description: 'id of the bimester',
    nullable: false,
  })
  @IsNumber()
  bimesterId: number;

  @ApiProperty({
    example: 'A',
    description: 'qualification of ratings',
    nullable: false,
  })
  @IsString()
  qualification: string;

  @ApiProperty({
    example: 'true',
    description: 'status of year, must be true or false',
    nullable: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
