import { IsOptional } from 'class-validator';
import { ExistId } from '../validation/exist-id';

export class SearchClassroomsDto {
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
  @ExistId({ tableName: 'phase' })
  phaseId?: string;

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
