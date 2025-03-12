import { ApiProperty } from '@nestjs/swagger';
import { ExistId } from 'src/common/validation/exist-id';
import { CreditNoteType } from '../enum/CreditNoteType.enum';
import { IsEnum } from 'class-validator';

export class CreateCreditNoteDto {
  @ApiProperty({
    description: 'voucher id',
    nullable: false,
    minLength: 1,
  })
  @ExistId({ tableName: 'bill' })
  voucherId: number;

  @ApiProperty({
    example: 'REGULAR',
    description: 'Credit Note Type',
    nullable: false,
    enum: CreditNoteType,
  })
  @IsEnum(CreditNoteType, {
    message: 'creditNoteType value must be some values: [1, 2..13] ',
  })
  creditNoteType: CreditNoteType;
}
