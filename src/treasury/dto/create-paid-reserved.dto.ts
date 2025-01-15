import { ApiProperty } from '@nestjs/swagger';
import { ExistId } from 'src/common/validation/exist-id';

export class CreatePaidReserved {
  @ApiProperty({
    description: 'student id ',
    nullable: false,
    minLength: 1,
  })
  @ExistId({ tableName: 'student' })
  studentId: number;

  @ApiProperty({
    description: 'id of parent for recip',
    nullable: false,
    minLength: 1,
  })
  @ExistId({ tableName: 'person' })
  parentId: number;
}
