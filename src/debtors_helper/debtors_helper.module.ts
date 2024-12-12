import { Module } from '@nestjs/common';
import { DebtorsHelperService } from './debtors_helper.service';
import { DebtorsHelperController } from './debtors_helper.controller';

@Module({
  controllers: [DebtorsHelperController],
  providers: [DebtorsHelperService],
})
export class DebtorsHelperModule {}
