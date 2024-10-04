import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNumber, IsOptional } from 'class-validator';
import { ExistId } from 'src/common/validation/exist-id';

export class CreateAscentDto {
  @ApiProperty({
    example: 1,
    description: 'id of the origin',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'activity_classroom' })
  originId: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'array of  Id destinations for this classroom',
    nullable: false,
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  @ExistId({ tableName: 'activity_classroom', isArray: true })
  destinations: number[];

  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'year' })
  yearId: number;
}
