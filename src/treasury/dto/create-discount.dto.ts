import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({
    description: 'discount percentage must be some values 1% to 100%',
    nullable: false,
    maxLength: 3,
  })
  @IsNumber()
  percentage: number;

  @ApiProperty({
    description: 'discount reason',
    nullable: false,
  })
  @IsString()
  reason: string;
}
