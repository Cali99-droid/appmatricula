import { ApiProperty } from '@nestjs/swagger';

import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Gender } from 'src/person/enum/gender.enum';

export class CreatePersonEnrollDto {
  @ApiProperty({
    example: '71562526',
    description: 'person DNI',
    uniqueItems: true,
  })
  @IsString()
  @Length(8, 8)
  @Matches(/^\d+$/, {
    message: 'DNI debe ser una cadena numérica',
  })
  @IsOptional() // Esto indica que el validador pasará si el campo es undefined o null
  @ValidateIf((o) => o.docNumber !== '') // Los siguientes validadores solo se aplicarán si docNumber no está vacío
  docNumber: string;

  @ApiProperty({
    example: 'Jose',
    description: 'name of person',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Herrera',
    description: 'lastName of person',
  })
  @IsString()
  lastname: string;

  @ApiProperty({
    example: 'Ramirez',
    description: 'mother lastName of person',
  })
  @IsString()
  mLastname: string;

  @ApiProperty({
    example: 'M',
    description: 'gender, must be M or F',
  })
  @IsEnum(Gender, {
    message: 'Gender value must be some values: [M, F] ',
  })
  gender: Gender;

  @ApiProperty({
    description: 'studentCode',
  })
  @IsString()
  studentCode: string;
}
