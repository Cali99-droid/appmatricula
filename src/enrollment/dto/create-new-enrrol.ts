import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateNewEnrollmentDto {
  @ApiProperty({
    example: '22332244',
    description: 'doc number the student',
    nullable: false,
  })
  @IsNumber()
  docNumber: number;
}
