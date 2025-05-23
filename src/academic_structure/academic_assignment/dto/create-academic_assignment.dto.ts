import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';
import { TypeAssignment } from '../entities/academic_assignment.entity';

export class CreateAcademicAssignmentDto {
  @ApiProperty({
    example: 'true',
    description: 'if the teacher is tutor',
    nullable: false,
  })
  @IsBoolean()
  isTutor: boolean;

  @ApiProperty({
    example: 'COMPLETE_AREA',
    description: 'type of assignment, must be COMPLETE_AREA or SPECIFIC_COURSE',
    nullable: false,
  })
  @IsEnum(TypeAssignment)
  typeAssignment: TypeAssignment;

  @ApiProperty({
    example: 1,
    description: 'id of the user',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'user' })
  userId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the competency',
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  @ExistId({ tableName: 'activity_course' })
  actCourseId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the competency',
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  @ExistId({ tableName: 'area' })
  areaId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the activityClassroom',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'activity_classroom' })
  activityClassroomId: number;
}
