import { ApiProperty } from '@nestjs/swagger';

import { IsString, Length, Matches } from 'class-validator';

export class UpdatePersonEnrollDto {
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
    description: 'siagie',
  })
  @IsString()
  siagie: string;

  @ApiProperty({
    description: 'studentCode',
  })
  @IsString()
  studentCode: string;
}
