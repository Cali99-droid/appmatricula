import { PartialType } from '@nestjs/mapped-types';
import { CreateDebtorsHelperDto } from './create-debtors_helper.dto';

export class UpdateDebtorsHelperDto extends PartialType(
  CreateDebtorsHelperDto,
) {}
