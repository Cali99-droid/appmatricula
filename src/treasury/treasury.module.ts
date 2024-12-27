import { Module } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { TreasuryController } from './treasury.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { Concept } from './entities/concept.entity';
import { Debt } from './entities/debt.entity';
import { Payment } from './entities/payment.entity';
import { Rates } from './entities/rates.entity';
import { Family } from 'src/family/entities/family.entity';

@Module({
  controllers: [TreasuryController],
  providers: [TreasuryService],
  imports: [
    TypeOrmModule.forFeature([Bill, Concept, Debt, Payment, Rates, Family]),
  ],
})
export class TreasuryModule {}