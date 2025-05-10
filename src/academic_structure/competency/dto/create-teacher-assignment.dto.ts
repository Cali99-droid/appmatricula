import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateTeacherCompetencyDto {
  @ApiProperty({
    example: 'true',
    description: 'if the teacher is tutor',
    nullable: false,
  })
  @IsBoolean()
  isTutor: boolean;
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
  @ExistId({ tableName: 'course' })
  courseId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the competency',
    nullable: true,
  })
  @IsNumber()
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
