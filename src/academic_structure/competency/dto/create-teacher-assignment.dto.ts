import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateTeacherCompetencyDto {
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
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'competency' })
  competencyId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the activityClassroom',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'activity_classroom' })
  activityClassroomId: number;
}
