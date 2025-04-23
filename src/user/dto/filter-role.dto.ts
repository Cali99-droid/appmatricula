import { IsOptional, IsString } from 'class-validator';

export class FilterUserByRoleDto {
  @IsOptional()
  @IsString()
  role?: string;
}
