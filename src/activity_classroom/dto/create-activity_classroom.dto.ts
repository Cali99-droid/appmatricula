import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsUppercase } from 'class-validator';
import { Section } from '../../activity_classroom/enum/section.enum';
import { ExistId } from 'src/common/validation/exist-id';
export class CreateActivityClassroomDto {
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
    example: 1,
    description: 'id of the classroom',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'classroom' })
  classroomId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the grade',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'grade' })
  gradeId: number;
  @ApiProperty({
    example: 1,
    description: 'id of the phase',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'phase' })
  phaseId: number;
  @ApiProperty({
    example: 1,
    description: 'id of the schoolShiftId(turno)',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'school_shift' })
  schoolShiftId: number;
}
