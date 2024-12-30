import { IsEnum } from 'class-validator';
import { PaymentMethod } from '../enum/PaymentMethod.enum';
import { ApiProperty } from '@nestjs/swagger';

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
}
