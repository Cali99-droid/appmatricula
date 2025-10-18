import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class GetDebtorsReport {
  @ApiProperty({
    description: 'activity classroom id',
    nullable: true,
  })
  @IsOptional()
  @ExistId({ tableName: 'activity_classroom' })
  activityClassroomId: number;

  @ApiProperty({
    description: 'level id',
    nullable: true,
  })
  @IsOptional()
  @ExistId({ tableName: 'level' })
  levelId: number;
}
