// src/transfer-meetings/dto/create-transfer-meeting.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransferMeetingType } from '../entities/transfer-meeting.entity';
import { ExistId } from 'src/common/validation/exist-id';
import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsFutureDate } from '../helpers/is-future-date.validator';

export class CreateTransferMeetingDto {
  @ApiProperty({
    description: 'Fecha del agendamiento en formato ISO 8601 (YYYY-MM-DD).',
    example: '2025-09-15',
  })
  @IsNotEmpty({ message: 'La fecha y hora de agendamiento es obligatoria.' })
  // @IsDateString(
  //   { strict: true },
  //   { message: 'El formato de la fecha y hora debe ser válido (ISO 8601).' },
  // )
  @Transform(({ value }) => {
    // Transformamos el string a un objeto Date y lo validamos
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        'El valor de la fecha y hora no es válido.',
      );
    }
    return date;
  })
  @IsDate({
    message: 'La fecha proporcionada no es un objeto de tipo Date válido.',
  })
  @IsFutureDate({
    message: 'La fecha y hora de agendamiento no puede ser en el pasado.',
  })
  public readonly meetingDate: Date;

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
