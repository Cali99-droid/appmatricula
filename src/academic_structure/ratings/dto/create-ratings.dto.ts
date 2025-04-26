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
  @IsNumber()
  competencyId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the bimester',
    nullable: false,
  })
  @IsNumber()
  bimesterId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the qualification',
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
