import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';
import { Holiday } from './entities/holiday.entity';
import { Year } from 'src/years/entities/year.entity';

@Module({
  controllers: [HolidayController],
  providers: [HolidayService],
  imports: [TypeOrmModule.forFeature([Holiday, Year])],
})
export class HolidayModule {}
