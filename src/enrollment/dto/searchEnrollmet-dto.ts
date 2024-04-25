import { IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class SearchEnrolledDto {
  //   @IsOptional()
  //   // @IsPositive()
  //   // @IsNumber()
  //   // @Min(1)
  //   @ExistId({ tableName: 'year' })
  //   yearId: string;

  //   @IsOptional()
  //   // @IsPositive()
  //   // @IsNumber()
  //   //@Min(1)
  //   @ExistId({ tableName: 'phase' })
  //   phaseId?: string;

  //   @IsOptional()
  // @IsPositive()
  // @IsNumber()
  //@Min(1)
  @ExistId({ tableName: 'year' })
  yearId?: string;

  @ExistId({ tableName: 'CampusDetail' })
  campusId?: string;

  @IsOptional()
  @ExistId({ tableName: 'level' })
  levelId?: string;
}
