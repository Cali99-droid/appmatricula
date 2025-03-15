import { ApiProperty } from '@nestjs/swagger';
import {  IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { TypeEmail } from '../enum/type-email';

export class CreateEmailDto {
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
  @ApiProperty({
    example: 'R',
    description: 'Tipo de Email, puede ser "R"(ratification), "O"(Other)',
    nullable: false,
    enum: TypeEmail,
  })
  @IsEnum(TypeEmail, {
    message: 'type value must be some values: [R,O] ',
  })
  type: TypeEmail;

  @ApiProperty({
    example: ['101', '305', '285'],
    description: 'Array of Student IDs',
    nullable: true,
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  // @IsString({ each: true, message: 'Each studentId must be a string.' })
  studentIds?: number[];
}
