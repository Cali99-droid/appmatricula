import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TransferMeetingType } from '../entities/transfer-meeting.entity';
import { ProcessState } from '../entities/transfer-request.entity';

// DTO for the nested TransferRequest object
export class TransferRequestDto {
  @ApiProperty({ description: 'The unique identifier of the transfer request' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: 'The unique code for the transfer request' })
  @IsString()
  @IsNotEmpty()
  requestCode: string;

  @ApiProperty({
    description: 'The status of the transfer request',
    enum: ProcessState,
  })
  @IsEnum(ProcessState)
  @IsNotEmpty()
  status: ProcessState;
}

// Main DTO for the meeting data
export class MeetingDto {
  @ApiProperty({ description: 'The unique identifier of the meeting' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'The date and time of the meeting in ISO 8601 format',
  })
  @IsDateString()
  @IsNotEmpty()
  meetingDate: string;

  @ApiProperty({ description: 'Notes related to the meeting', required: false })
  @IsString()
  notes: string;

  @ApiProperty({
    description: 'The type of the meeting',
    enum: TransferMeetingType,
  })
  @IsEnum(TransferMeetingType)
  @IsNotEmpty()
  type: TransferMeetingType;

  @ApiProperty({
    description: 'The associated transfer request details',
    type: () => TransferRequestDto,
  })
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TransferRequestDto)
  transferRequest: TransferRequestDto;
}
