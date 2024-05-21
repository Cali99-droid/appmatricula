import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { Schedule } from './entities/schedule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
  imports: [TypeOrmModule.forFeature([Schedule, ActivityClassroom])],
})
export class ScheduleModule {}
