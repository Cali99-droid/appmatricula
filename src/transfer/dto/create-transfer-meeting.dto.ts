// src/transfer-meetings/dto/create-transfer-meeting.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransferMeetingType } from '../entities/transfer-meeting.entity';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateTransferMeetingDto {
  @ApiProperty({
    description: 'Fecha del agendamiento en formato ISO 8601 (YYYY-MM-DD).',
    example: '2025-09-15',
  })
  @IsDateString({}, { message: 'La fecha debe estar en formato YYYY-MM-DD.' })
  @IsNotEmpty({ message: 'La fecha del agendamiento es obligatoria.' })
  meetingDate: Date;

  @ApiPropertyOptional({
    description: 'Notas o comentarios adicionales sobre la reunión.',
    example: 'Se discutirán los motivos de la solicitud de traslado.',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description:
      'Tipo de reunión, agendada por el psicólogo o el administrador.',
    enum: TransferMeetingType,
    example: TransferMeetingType.PSYCHOLOGIST,
  })
  @IsEnum(TransferMeetingType, { message: 'El tipo de reunión no es válido.' })
  @IsNotEmpty({ message: 'El tipo de reunión es obligatorio.' })
  type: TransferMeetingType;

  @ApiProperty({
    description:
      'ID de la solicitud de traslado a la que pertenece este agendamiento.',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'El ID de la solicitud de traslado es obligatorio.' })
  @ExistId({ tableName: 'transfer_request' })
  transferRequestId: number;
}
