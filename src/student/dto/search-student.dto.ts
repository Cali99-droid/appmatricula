import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class SearchEstudiantesDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
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

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
