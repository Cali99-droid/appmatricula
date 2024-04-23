import { Module } from '@nestjs/common';
import { DayOfWeekService } from './day_of_week.service';
import { DayOfWeekController } from './day_of_week.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayOfWeek } from './entities/day_of_week.entity';

@Module({
  controllers: [DayOfWeekController],
  providers: [DayOfWeekService],
  imports: [TypeOrmModule.forFeature([DayOfWeek])],
})
export class DayOfWeekModule {}
