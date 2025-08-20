// src/search/dto/advanced-search.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export enum SearchableRole {
  STUDENT = 'student',
  PARENT = 'parent',
  // Puedes agregar más roles aquí en el futuro
}

export class AdvancedSearchDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  term: string;

  //   @IsEnum(SearchableRole)
  //   @IsNotEmpty()
  //   role: SearchableRole;
}
