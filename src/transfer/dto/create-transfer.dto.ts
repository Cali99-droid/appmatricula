import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({
    description: 'Reason of the Transfers',
    nullable: false,
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  district: string;

  @ApiProperty({
    description: 'Reason of the Transfers',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(4)
  schoolDestination: string;

  @ApiProperty({
    description: 'Reason of the Transfers',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  reason: string;

  @ApiProperty({
    description: 'Start of the Transfers',
    nullable: false,
  })
  @IsDateString()
  transfersDate: string;

  @ApiProperty({
    description: 'studentId',
    nullable: false,
  })
  @IsNumber()
  @Type(() => Number)
  studentId: number;

  @ApiProperty({
    example: 'true',
    description: 'status of Transfers, must be true or false',
    nullable: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
