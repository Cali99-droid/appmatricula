import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, IsOptional, IsInt } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateCampusDto {
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
  @IsOptional()
  @ExistId({ tableName: 'year' })
  yearId: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'array of  Id levels for this campus',
    nullable: false,
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  @ExistId({ tableName: 'level', isArray: true })
  levels: number[];
}
