import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TypeSure } from '../enum/type-sure.enum';
import { PaymentPref } from '../enum/payment-pref.enum';

export class CreateFamilyDto {
  @ApiProperty({
    description: 'Name Family of the family',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  nameFamily: string;

  @ApiProperty({
    example: 1,
    description: 'id of the person parent one',
    nullable: false,
  })
  @IsNumber()
  parentOneId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the person parent two',
    nullable: false,
  })
  @IsNumber()
  parentTwoId: number;

  @ApiProperty({
    example: '230301',
    description: 'district code',
  })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({
    example: '121',
    description: 'family addres',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: '121',
    description: 'family address reference',
  })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({
    example: 'ESSALUD',
    description: 'Type Sure ,ESSALUD or OTRO',
  })
  @IsEnum(TypeSure, {
    message: 'type value must be some values: [ESSALUD, OTRO] ',
  })
  @IsOptional()
  type_sure?: TypeSure;

  @ApiProperty({
    example: 'ESSALUD',
    description: 'name sure',
  })
  @IsString()
  @IsOptional()
  sure?: string;

  @ApiProperty({
    example: 'Calle arequipa 123',
    description: 'addres Sure',
  })
  @IsString()
  @IsOptional()
  addressSure?: string;

  @ApiProperty({
    example: 1,
    description: 'Reponsability Enrollment of the Student',
  })
  @IsNumber()
  @IsOptional()
  respEnrollment?: number;

  @ApiProperty({
    example: 1,
    description: 'Reponsability Economic of the Student',
  })
  @IsNumber()
  @IsOptional()
  respEconomic?: number;

  @ApiProperty({
    example: 1,
    description: 'Reponsability Academic of the Student',
  })
  @IsNumber()
  @IsOptional()
  respAcademic?: number;

  @ApiProperty({
    example: 'BBVA',
    description: 'Type Sure ,ESSALUD or OTRO',
  })
  @IsEnum(PaymentPref, {
    message: 'type value must be some values: [ESSALUD, OTRO] ',
  })
  @IsOptional()
  paymentPref?: PaymentPref;
}
