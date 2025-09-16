// src/request-tracking/dto/create-request-tracking.dto.ts
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
} from 'class-validator';
import {
  ProcessStateTracking,
  RequestTrackingArea,
} from '../entities/transfer-resquest-tracking.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestTrackingDto {
  @ApiProperty({
    example: '2025-09-16T17:11:13.000Z',
    description: 'date of arrival',
    nullable: false,
  })
  @IsOptional()
  @IsDateString()
  arrivalDate?: Date;

  @ApiProperty({
    example: 'Informacion de proceso',
    description: 'descripcion del estado de solicitud',
    nullable: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: 'PSYCHOLOGY',
    description: 'Area en donde se encuentra la solicitud',
    nullable: false,
  })
  @IsEnum(RequestTrackingArea)
  area: RequestTrackingArea;

  @ApiProperty({
    example: 'REGISTERED',
    description: 'Estado de la solicitud',
    nullable: false,
  })
  @IsOptional()
  @IsEnum(ProcessStateTracking)
  status?: ProcessStateTracking;

  @ApiProperty({
    example: 'JUANA LOPEZ',
    description: 'responsable de area',
    nullable: false,
  })
  @IsOptional()
  responsible?: string;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsNumber()
  transferRequestId: number;
}
