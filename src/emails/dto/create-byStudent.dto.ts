import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateEmailByStudentDto {
  @ApiProperty({
    example: '70980998',
    description: 'Doct Numer to Student',
    nullable: false,
  })
  @IsString()
  docNumber: string;
  @ApiProperty({
    example: 'Envio para Retificacion de Matricula 2024',
    description: 'subject to Email',
    nullable: false,
  })
  @IsString()
  subject: string;
  @ApiProperty({
    example: 'Buenas padre de familia',
    description: 'body to Email',
    nullable: false,
  })
  @IsString()
  body: string;
}
