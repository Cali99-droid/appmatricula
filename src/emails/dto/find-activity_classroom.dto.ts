import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExistId } from 'src/common/validation/exist-id';

export class FindActivityClassroomDto {
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
}
