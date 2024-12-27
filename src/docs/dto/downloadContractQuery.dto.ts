import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DownloadContractQueryDto {
  @ApiProperty({
    description: 'Sede donde se encuentra el estudiante',
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  campus: number;

  @ApiProperty({
    description: 'Nivel educativo del estudiante',
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  level: number;

  @ApiProperty({
    description: 'Grado del estudiante',
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  grade: number;

  @ApiProperty({
    description: 'Sección del estudiante',
    example: 'A',
  })
  @IsNotEmpty()
  @IsString()
  section: string;
}
