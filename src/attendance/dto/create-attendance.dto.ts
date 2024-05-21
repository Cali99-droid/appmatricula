import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({
    example: '2024-P1S34',
    description: 'code of the QR',
    nullable: false,
  })
  @IsString()
  code: string;
}
