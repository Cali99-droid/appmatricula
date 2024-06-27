import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MinLength } from 'class-validator';

export class CreateFamilyDto {
  @ApiProperty({
    description: 'Name Family of the family',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  nameFamily: string;

  @ApiProperty({
    example: 1,
    description: 'id of the person parent one',
    nullable: false,
  })
  @IsNumber()
  parentOneId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the person parent two',
    nullable: false,
  })
  @IsNumber()
  parentTwoId: number;
}
