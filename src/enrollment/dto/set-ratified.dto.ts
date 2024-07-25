import { IsString, MaxLength, MinLength } from 'class-validator';

export class SetRatifiedDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1)
  desicion: string;
}
