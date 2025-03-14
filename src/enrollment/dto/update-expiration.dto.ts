import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class UpdateExpirationDto {
  @ApiProperty({
    description: 'New expiration',
    nullable: false,
  })
  @IsDateString()
  newExpiration: string;
}
