import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TransferStudentDto {
  @ApiProperty({
    example: 'COLEGIO EDUCATIVO EJEMPLO',
    description: 'nombre del colegio destino',
    nullable: false,
  })
  @IsString()
  destinationSchool: string;
}
