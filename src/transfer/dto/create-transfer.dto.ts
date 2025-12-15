// src/transfers/dto/create-transfer.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export enum TransferType {
  INTERNAL = 'INTERNAL',
  CAMPUS = 'CAMPUS',
  EXTERNAL = 'EXTERNAL',
}

export class CreateTransferDto {
  @ApiProperty({
    description:
      'ID único del estudiante para el cual se solicita el traslado.',
    example: 123,
    type: Number,
  })
  @IsInt({ message: 'El ID del estudiante debe ser un número entero.' })
  @Min(1)
  @IsNotEmpty({ message: 'El ID del estudiante es obligatorio.' })
  @ExistId({ tableName: 'student' })
  studentId: number;

  @ApiProperty({
    description: 'ID único del padre para el cual  solicita el traslado.',
    example: 123,
    type: Number,
  })
  @IsInt({ message: 'El ID del padre debe ser un número entero.' })
  @Min(1)
  @IsNotEmpty({ message: 'El ID del padre  es obligatorio.' })
  @ExistId({ tableName: 'person' })
  parentId: number;

  @ApiProperty({
    description: 'Tipo de traslado que se está solicitando.',
    enum: TransferType,
    example: TransferType.INTERNAL,
  })
  @IsEnum(TransferType, {
    message: 'El tipo de traslado debe ser INTERNAL o EXTERNAL.',
  })
  @IsNotEmpty({ message: 'El tipo de traslado es obligatorio.' })
  type: TransferType;

  @ApiProperty({
    description: 'ID del aula o sección de origen del estudiante.',
    example: 10,
    type: Number,
  })
  @IsInt({ message: 'El ID del aula de origen debe ser un número entero.' })
  @IsNotEmpty({ message: 'El aula de origen es obligatoria.' })
  @ExistId({ tableName: 'activity_classroom' })
  originClassroomId: number;

  @ApiPropertyOptional({
    description:
      'ID del aula o sección destino. Requerido si el tipo de traslado es INTERNAL.',
    example: 11,
    type: Number,
  })
  @ValidateIf((o) => o.type === TransferType.INTERNAL)
  @IsInt({ message: 'El ID del aula destino debe ser un número entero.' })
  @IsNotEmpty({
    message: 'El aula destino es obligatoria para traslados internos.',
  })
  @IsOptional()
  @ExistId({ tableName: 'activity_classroom' })
  destinationClassroomId?: number;

  @ApiPropertyOptional({
    description:
      'ID de la sede o colegio destino. Requerido si el tipo de traslado es EXTERNAL.',
    example: 2,
    type: Number,
  })
  @ValidateIf((o) => o.type === TransferType.EXTERNAL)
  @IsInt({ message: 'El ID de la sede destino debe ser un número entero.' })
  @IsNotEmpty({
    message: 'La sede destino es obligatoria para traslados externos.',
  })
  @IsOptional()
  @ExistId({ tableName: 'campus' })
  destinationCampusId?: number;

  @ApiPropertyOptional({
    description:
      'Nombre del colegio destino, en caso de ser un traslado a otra institución.',
    example: 'Colegio Innova Schools',
  })
  @ValidateIf((o) => o.type === TransferType.EXTERNAL && !o.destinationCampusId)
  @IsString()
  @IsOptional()
  destinationSchoolName?: string;

  @ApiProperty({
    example: 'una observación',
    description: 'observacion y/o motivo del traslado',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  reason: string;
}
