import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
export class DataDebtorsDto {
  @ApiProperty({
    example: 'YAURI VILLANUEVA SAMIN ROMER',
    description: 'code of student',
  })
  @IsString()
  @IsNotEmpty()
  // @Length(3, 10)  Suponiendo que el código tiene entre 3 y 10 caracteres.
  student: string;

  @ApiProperty({
    example: '63193192',
    description: 'person DNI',
    uniqueItems: true,
  })
  @IsString()
  @Length(8, 8)
  @Matches(/^\d+$/, {
    message: ' docNumber DNI debe ser una cadena numérica',
  })
  docNumber: string;

  @ApiProperty({
    example: 'VILLANUEVA MARTINEZ ANA MAGALY',
    description: 'name of person',
  })
  @IsString()
  family: string;

  @ApiProperty({
    example: '943560805',
    description: 'lastName of person',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'JR HUAYLAS 250',
    description: 'mother lastName of person',
  })
  @IsString()
  address: string;
}
