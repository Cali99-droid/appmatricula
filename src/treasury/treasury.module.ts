import { Module } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { TreasuryController } from './treasury.controller';

@Module({
  controllers: [TreasuryController],
  providers: [TreasuryService],
})
export class TreasuryModule {}
