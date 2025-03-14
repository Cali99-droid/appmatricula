import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateUserOfTestDto {
  // @IsNumber()
  // @IsOptional()

  @ApiProperty({
    description: 'grade id',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'grade' })
  gradeId: number;

  @ApiProperty({
    description: 'phase id',
    nullable: false,
  })
  @ExistId({ tableName: 'phase' })
  phaseId: number;
}
