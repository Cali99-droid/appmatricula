import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNumber } from 'class-validator';

export class CreateGradeDto {
  @ApiProperty({
    description: 'Name of the grade (unique)',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;
  @ApiProperty({
    example: 1,
    description: 'id of the level',
    nullable: false,
  })
  @IsNumber()
  levelId: number;
}
