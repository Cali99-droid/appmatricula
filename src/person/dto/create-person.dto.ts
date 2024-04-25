import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../enum/gender.enum';
import { IsEnum, IsString, Length, Matches } from 'class-validator';

export class CreatePersonDto {
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
