import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateReferDto {
  @ApiProperty({
    example: 1,
    description: 'id of the children',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'person' })
  childrenId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the parent',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'person' })
  parentId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the classroom',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'activity_classroom' })
  activityClassroomId: number;
}
