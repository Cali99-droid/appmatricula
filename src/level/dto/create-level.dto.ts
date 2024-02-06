import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from '@nestjs/class-validator';
import { Transform } from 'class-transformer';
export class CreateLevelDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Nombre no puede estar vacío' })
  @IsString({ message: 'Nombre debe ser STRING' })
  @Transform(({ value }) => value.toUpperCase().trim())
  name: string;
}
