import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Behavior } from '../enum/behavior.enum';

export class UpdateBehaviorDto {
  @ApiProperty({
    example: 'conditional registration',
    description: 'behavior of enrollment',
  })
  @IsString()
  behavior: Behavior;
  @ApiProperty({
    example: 'Impuntual todos los dias',
    description: 'behaviorDescription of enrollment',
  })
  @IsString()
  behaviorDescription: string;
}
