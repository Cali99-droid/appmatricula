import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateClassroomDto {
  @ApiProperty({
    description: 'Capacity from classroom',
    nullable: false,
    minLength: 2,
  })
  @IsNumber()
  capacity: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @MinLength(1)
  section: string;

  @IsString()
  @MinLength(1)
  modality: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsNumber()
  campusDetailId: number;

  @IsNumber()
  gradeId: number;
}
