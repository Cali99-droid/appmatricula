import { ApiProperty } from '@nestjs/swagger';

export class RespGetTeacherAssignmentDto {
  @ApiProperty({
    example: 1,
    description: 'id de la asignacion',
  })
  id: number;

  @ApiProperty({
    example: 'Primaria - 2do grado C',
    description: 'nivel grado seccion de la asignacion',
  })
  classroom: string;

  @ApiProperty({
    example: 'MATEMATICA',
    description: 'area de la asignacion',
  })
  area: string;

  @ApiProperty({
    example: 'ALGEBRA',
    description: 'curso del area, el area puede o no tener curso',
  })
  course: string;

  @ApiProperty({
    example: 'PINEDA CAMONES STEFANY RUBI',
    description: 'Lista de pagos fallidos con sus razones',
  })
  teacher: string;
}
