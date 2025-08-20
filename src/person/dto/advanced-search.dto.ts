// src/search/dto/advanced-search.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum SearchableScope {
  STUDENT = 'student',
  PARENT = 'parent',
  OTHER = 'other',
  // Puedes agregar más roles aquí en el futuro
}

export class AdvancedSearchDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  term: string;

  @IsEnum(SearchableScope)
  @IsOptional()
  scope: SearchableScope;
}
