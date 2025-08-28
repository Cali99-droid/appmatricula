import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AuthorRole } from '../entities/transfer-report.entity';

export class CreateTransferReportDto {
  @ApiProperty({
    description:
      'Conclusión del informe. `true` para favorable, `false` para no favorable.',
    example: true,
  })
  @IsBoolean({ message: 'La conclusión debe ser un valor booleano.' })
  @IsNotEmpty({ message: 'La conclusión es obligatoria.' })
  conclusion: boolean;

  @ApiPropertyOptional({
    description: 'Contenido o justificación detallada del informe.',
    example:
      'El estudiante presenta una buena adaptación social y se beneficiaría del cambio.',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Rol del autor del informe.',
    enum: AuthorRole,
    example: AuthorRole.PSYCHOLOGIST,
  })
  @IsEnum(AuthorRole, { message: 'El rol del autor no es válido.' })
  @IsNotEmpty({ message: 'El rol del autor es obligatorio.' })
  authorRole: AuthorRole;

  @ApiProperty({
    description:
      'ID de la solicitud de traslado a la que pertenece este informe.',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'El ID de la solicitud de traslado es obligatorio.' })
  transferRequestId: number;
}
