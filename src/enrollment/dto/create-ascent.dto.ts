import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
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
    example: 1,
    description: 'id of the destination',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'activity_classroom' })
  destinationId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the year',
    nullable: false,
  })
  @IsNumber()
  @ExistId({ tableName: 'year' })
  yearId: number;
}
