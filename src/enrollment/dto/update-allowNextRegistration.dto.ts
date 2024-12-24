import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
export class UpdateAllowNextRegistrationDto {
  @ApiProperty({
    example: true,
    description: 'AllowNextRegistration of enrollment',
  })
  @IsBoolean()
  allowNextRegistration: boolean;
}
