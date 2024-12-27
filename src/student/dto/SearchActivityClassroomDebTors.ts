import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchActivityClassroomDebTors {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}