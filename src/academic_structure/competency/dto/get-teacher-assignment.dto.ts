import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class GetTeacherAssignmentDto {
  @ApiProperty({
    example: 1,
    description: 'id of the user',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @ExistId({ tableName: 'user' })
  userId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the activity classroom',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @ExistId({ tableName: 'activity_classroom' })
  activityClassroomId?: number;

  //   @ApiProperty({
  //     example: 1,
  //     description: 'id of the year',
  //     nullable: false,
  //   })
  //   @IsOptional()
  //   @IsNumber()
  //   @ExistId({ tableName: 'phase' })
  //   phaseId: number;
}
