import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateEnrollmentDto {
  @ApiProperty({
    example: 1,
    description: 'id of the student',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'student' })
  studentId: number;

  @ApiProperty({
    example: 2,
    description: 'Id activityClassroom for this enrollment',
    nullable: false,
    required: true,
  })
  @ExistId({ tableName: 'activity_classroom' })
  activityClassroomId: number;
  // @ApiProperty({
  //   example: 'DEFINITIVA',
  //   description: 'type of phase, must be EN PROCESO, TRASLADADO , DEFINITIVA',
  //   nullable: false,
  //   enum: Status,
  // })
  // @IsEnum(Status, {
  //   message:
  //     'type value must be some values: [EN PROCESO, TRASLADADO , DEFINITIVA] ',
  // })
  // status: Status;
}
