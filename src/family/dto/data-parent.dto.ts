import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Gender } from 'src/common/enum/gender.enum';
import { FamilyRole } from '../../common/enum/family-role.enum';

export class DataParentDto {
  @ApiProperty({
    example: '23120393400220',
    description: 'code of student',
  })
  @IsString()
  @IsNotEmpty()
  // @Length(3, 10)  Suponiendo que el código tiene entre 3 y 10 caracteres.
  studentCode: string;

  @ApiProperty({
    example: '71562526',
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
    example: 'P',
    description: 'role of person M: MADRE, P: PADRE, H: HIJO',
  })
  @IsEnum(FamilyRole, {
    message: 'Family Role value must be some values: [M, P, H]',
  })
  familyRole: FamilyRole;
}
