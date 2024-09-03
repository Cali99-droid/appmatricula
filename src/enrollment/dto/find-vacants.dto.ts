import { IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class FindVacantsDto {
  //   @ExistId({ tableName: 'year' })
  //   yearId: number;

  @ExistId({ tableName: 'campus_detail' })
  campusId: number;

  @IsOptional()
  @ExistId({ tableName: 'level' })
  levelId?: number;
}
