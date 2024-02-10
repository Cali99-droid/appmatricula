import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateGradeDto {
  @ApiProperty({
    description: 'Name of the grade (unique)',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;
}
