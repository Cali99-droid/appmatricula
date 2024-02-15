import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateCampusXLevelDto {
  @ApiProperty({
    example: 1,
    description: 'id of the campusXlevel',
    nullable: false,
  })
  @IsNumber()
  campusId: number;

  @ApiProperty({
    example: 1,
    description: 'Id of the level',
    nullable: false,
  })
  @IsNumber({}, { each: true })
  levelId: number;
}
