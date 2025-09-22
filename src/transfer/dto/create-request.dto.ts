import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateInternalResquestDto {
  @ApiProperty({
    example: 1,
    description: 'id of the children',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'student' })
  studentId: number;

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

  @ApiProperty({
    example: 'una observación',
    description: 'observacion y/o motivo del traslado',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  reason: string;
}
