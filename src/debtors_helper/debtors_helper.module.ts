import { Module } from '@nestjs/common';
import { DebtorsHelperService } from './debtors_helper.service';
import { DebtorsHelperController } from './debtors_helper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebtorsHelper } from './entities/debtors_helper.entity';
import { Student } from '../student/entities/student.entity';

@Module({
  controllers: [DebtorsHelperController],
  providers: [DebtorsHelperService],
  imports: [TypeOrmModule.forFeature([DebtorsHelper, Student])],
  exports: [TypeOrmModule],
})
export class DebtorsHelperModule {}
