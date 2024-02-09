import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampusXLevelGradeDto {
  //   @ApiProperty({
  //     example: 1,
  //     description: 'id of the campus',
  //     type: Number,
  //   })
  //   @IsNumber(
  //     { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
  //     { message: 'Campus has to be an id' },
  //   )
  //   campusId: number;
  //   @ApiProperty({
  //     example: 1,
  //     description: 'id of the level',
  //     type: Number,
  //   })
  //   @IsNumber(
  //     { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
  //     { message: 'Level has to be an id' },
  //   )
  //   levelId: number;
  //   @ApiProperty({
  //     example: 1,
  //     description: 'id of the grade',
  //     type: Number,
  //   })
  //   @IsNumber(
  //     { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
  //     { message: 'Grade has to be an id' },
  //   )
  //   gradeId: number;
  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  campusId: number;
  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  levelId: number;
  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  gradeId: number;
}
