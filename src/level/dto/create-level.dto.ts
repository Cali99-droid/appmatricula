import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateLevelDto {
  @ApiProperty({
    description: 'Name of the level (unique)',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;
}
