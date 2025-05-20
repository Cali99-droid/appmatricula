import {
  IsInt,
  IsBoolean,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateActivityCourseDto {
  @ApiProperty({
    example: 1,
    description: 'id of the course',
    nullable: false,
  })
  @IsNumber()
  @IsInt()
  @ExistId({ tableName: 'course' })
  courseId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the course',
    nullable: false,
  })
  @IsNumber()
  @IsInt()
  @ExistId({ tableName: 'level' })
  levelId: number;

  // @ApiProperty({
  //   example: 1,
  //   description: 'id of the phase',
  //   nullable: false,
  // })
  // @IsNumber()
  // @ExistId({ tableName: 'phase' })
  // phaseId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the campusDetail',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'campus' })
  campusId: number;

  @ApiProperty({
    example: true,
    description: 'if is for all grades',
    nullable: false,
  })
  @IsBoolean()
  forAllGrades: boolean;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'array of competencies',
    nullable: false,
    isArray: true,
  })
  @IsArray()
  @IsInt({ each: true })
  @ExistId({ tableName: 'competency', isArray: true })
  competencies: number[];

  @ApiProperty({
    example: [1, 2, 3],
    description: 'array of grades',
    nullable: false,
    isArray: true,
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ExistId({ tableName: 'grade', isArray: true })
  grades?: number[];
}
