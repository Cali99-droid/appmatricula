import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class CreateEmailByStudentDto {
  @ApiProperty({
    example: ['101', '305', '285'],
    description: 'Array of Student IDs',
    nullable: false,
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'The array of student IDs should not be empty.' })
  @IsString({ each: true, message: 'Each studentId must be a string.' })
  studentIds: number[];

  @ApiProperty({
    example: 'Envio para Rectificación de Matrícula 2024',
    description: 'Subject of the email',
    nullable: false,
  })
  @IsString()
  subject: string;

  @ApiProperty({
    example: 'Estimado padre de familia...',
    description: 'Body of the email',
    nullable: false,
  })
  @IsString()
  body: string;
}
