import { ApiProperty } from '@nestjs/swagger';

import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { FamilyRole } from 'src/common/enum/family-role.enum';
import { Gender } from 'src/common/enum/gender.enum';
import { TypeDoc } from '../enum/typeDoc.enum';

export class CreatePersonDto {
  @ApiProperty({
    example: 'DNI',
    description: 'Gender value must be some values: [DNI, CE] ',
  })
  @IsString()
  typeDoc: TypeDoc;

  @ApiProperty({
    example: '71562526',
    description: 'person DNI',
    uniqueItems: true,
  })
  @IsString()
  @Length(8, 12)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'El docNumber debe contener solo caracteres alfanuméricos',
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
  @IsOptional()
  studentCode: string;

  @ApiProperty({
    example: '952298329',
    description: 'cellPhone',
  })
  @IsString()
  @IsOptional()
  cellPhone: string;

  @ApiProperty({
    example: '1996-10-25',
    description: 'birthDate',
  })
  @IsDateString()
  @IsOptional()
  birthDate: Date;

  @ApiProperty({
    example: 'Zapatero Nuclear',
    description: 'profession',
  })
  @IsString()
  @IsOptional()
  profession: string;

  @ApiProperty({
    example: 'M',
    description: 'family Role  of student',
  })
  @IsEnum(FamilyRole, {
    message: 'FamilyRole value must be some values: [M,P,H] ',
  })
  familyRole: FamilyRole;
}
