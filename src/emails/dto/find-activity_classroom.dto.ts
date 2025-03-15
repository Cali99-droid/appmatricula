import { IsEnum, IsOptional, IsUppercase } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExistId } from 'src/common/validation/exist-id';
import { Section } from 'src/activity_classroom/enum/section.enum';

export class FindActivityClassroomDto {
  @ApiProperty({
    example: 1,
    description: 'id of the phase',
    nullable: false,
  })
  @IsOptional()
  // @IsNumber()
  // @ExistId({ tableName: 'phase' })
  phaseId?: number;
  @ApiProperty({
    example: 1,
    description: 'id of the campus',
  })
  @IsOptional()
  // @IsNumber()
  @ExistId({ tableName: 'campus_detail' })
  campusId?: number;

  @ApiProperty({
    example: 1,
    description: 'id of the level',
  })
  @IsOptional()
  // @IsNumber()
  @ExistId({ tableName: 'level' })
  levelId?: number;

  @ApiProperty({
    example: 1,
    description: 'id of the grade',
  })
  @IsOptional()
  // @IsNumber()
  @ExistId({ tableName: 'grade' })
  gradeId?: number;

  @ApiProperty({
    example: 'A',
    description: 'Letter Section',
  })
  @IsUppercase()
  @IsEnum(Section, {
    message: 'type value must be some values of alphabet ',
  })
  @IsOptional()
  section?: Section;
}
