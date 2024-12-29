import { IsEnum } from 'class-validator';
import { PaymentMethod } from '../enum/PaymentMethod.enum';

export class CreateTreasuryDto {
  @IsEnum(PaymentMethod, {
    message: 'paymentMethod type value must be some values: [1, 2, 3, 4] ',
  })
  //   @IsOptional()
  paymentMethod?: PaymentMethod;
}
