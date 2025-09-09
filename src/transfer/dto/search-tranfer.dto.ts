import { IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';
import { MainStatus } from '../entities/transfer-request.entity';

export class SearchTranfersDto {
  // @IsOptional()
  // @IsPositive()
  // @IsNumber()
  // @Min(1)

  @IsOptional()
  @ExistId({ tableName: 'level' })
  levelId?: number;

  @IsOptional()
  @ExistId({ tableName: 'campus' })
  campusId?: number;

  @IsOptional()
  status: MainStatus;

  //   @IsOptional()
  //   @ExistId({ tableName: 'grade' })
  //   gradeId?: number;

  //   @IsOptional()
  //   @ExistId({ tableName: 'phase' })
  //   phaseId?: number;
}
