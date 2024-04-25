import { IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class SearchSheduleDto {
  @IsOptional()
  // @IsPositive()
  // @IsNumber()
  // @Min(1)
  @ExistId({ tableName: 'year' })
  yearId: string;

  @IsOptional()
  // @IsPositive()
  // @IsNumber()
  //@Min(1)
  @ExistId({ tableName: 'CampusDetail' })
  campusId?: string;

  @IsOptional()
  @ExistId({ tableName: 'level' })
  levelId?: string;
}
