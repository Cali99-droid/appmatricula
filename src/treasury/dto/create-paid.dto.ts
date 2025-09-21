import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { PaymentMethod } from '../enum/PaymentMethod.enum';
import { ApiProperty } from '@nestjs/swagger';
import { ExistId } from 'src/common/validation/exist-id';

export class CreatePaidDto {
  @ApiProperty({
    description: 'paymentMethod must be some values: [1, 2, 3, 4]',
    nullable: false,
    minLength: 1,
  })
  @IsEnum(PaymentMethod, {
    message: 'paymentMethod type value must be some values: [1, 2, 3, 4] ',
  })
  //   @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'client id',
    nullable: false,
  })
  @IsNumber()
  @IsOptional()
  @ExistId({ tableName: 'person' })
  parentId?: number;
}
