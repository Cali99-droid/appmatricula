import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUppercase,
  MinLength,
} from 'class-validator';
import { Section } from '../enum/section.enum';

export class CreateClassroomDto {
  @ApiProperty({
    example: 22,
    description: 'Capacity from classroom',
    nullable: false,
    minLength: 2,
  })
  @IsNumber()
  capacity: number;

  // @ApiProperty({
  //   example: 'A',
  //   nullable: true,
  //   description: 'optional',
  // })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    example: 'A',
    nullable: false,
    description:
      'optional, section of classroom, must be a letter uppercase of alphabet',
  })
  @IsUppercase()
  @IsEnum(Section, {
    message: 'type value must be some values of alphabet ',
  })
  section: Section;

  @ApiProperty({
    example: 'P (presencial)',
    description:
      'optional, type of classroom, must be P (presencial) or V (virtual)',
  })
  @IsString()
  @MinLength(1)
  modality: string;

  @ApiProperty({
    example: true,
    description: 'optional, true or false',
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({
    example: 1,
    description: 'id of the campusDetail',
    nullable: false,
  })
  @IsNumber()
  campusDetailId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the grade',
    nullable: false,
  })
  @IsNumber()
  gradeId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the schoolShiftId(turno)',
    nullable: false,
  })
  @IsNumber()
  schoolShiftId: number;
}
