import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';

import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
// import { Gender } from 'src/common/enum/gender.enum';
function ToUpperCase(value: string): string {
  return value.toUpperCase();
}
export class CreatePersonCrmDto {
  @ApiProperty({
    example: 'x5nrn6P28eb3WgJq4CVp',
    description: 'Contact Id to CRM  ',
  })
  @IsNotEmpty()
  @IsString()
  crmGHLId: string;

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
  docNumber: string;

  @ApiProperty({
    example: 'Jose',
    description: 'name of person',
  })
  @IsString()
  @Transform(({ value }: TransformFnParams) => ToUpperCase(value))
  name: string;

  @ApiProperty({
    example: 'Herrera',
    description: 'lastName of person',
  })
  @IsString()
  @Transform(({ value }: TransformFnParams) => ToUpperCase(value))
  lastName: string;

  @ApiProperty({
    example: 'Ramirez',
    description: 'mother lastName of person',
  })
  @IsString()
  @Transform(({ value }: TransformFnParams) => ToUpperCase(value))
  mLastname: string;

  @ApiProperty({
    example: 'Masculino',
    description: 'Gender value must be some values: [Masculino, Femenino] ',
  })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'Email of person',
  })
  @IsString()
  email: string;
  // @ApiProperty({
  //   example: 'M',
  //   description: 'gender, must be M or F',
  // })
  // @IsEnum(Gender, {
  //   message: 'Gender value must be some values: [M, F] ',
  // })
  // gender: Gender;

  // @ApiProperty({
  //   description: 'studentCode',
  // })
  // @IsString()
  // studentCode: string;
}
