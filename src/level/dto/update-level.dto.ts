import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
} from '@nestjs/class-validator';
export class UpdateLevelDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Nombre no puede estar vacío' })
  @IsString({ message: 'Nombre debe ser STRING' })
  @Transform(({ value }) => value.toUpperCase(), { toClassOnly: true })
  @Transform(({ value }) => value.trim(), { toClassOnly: true })
  name: string;
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty({ message: 'Status no puede estar vacío' })
  @IsBoolean({ message: 'Status debe ser true / false' })
  status: boolean;
}
