import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray } from 'class-validator';
import { UpdateCampusXLevelJsonDto } from '../../campus_x_level/dto/update-campus_x_levelJson.dto';

export class UpdateCampusAndlevelDto {
  @ApiProperty({
    example: 1,
    description: 'id of the campusDetail',
    nullable: false,
  })
  @IsNumber()
  campusDetailId: number;
  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  yearId: number;

  @ApiProperty({
    type: () => [UpdateCampusXLevelJsonDto],
  })
  @IsArray()
  campusXlevelId: UpdateCampusXLevelJsonDto[];
}
