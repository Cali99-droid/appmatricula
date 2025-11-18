import { Module } from '@nestjs/common';
import { EnrollmentScheduleService } from './enrollment_schedule.service';
import { EnrollmentScheduleController } from './enrollment_schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentSchedule } from './entities/enrollment_schedule.entity';
import { Year } from 'src/years/entities/year.entity';

@Module({
  controllers: [EnrollmentScheduleController],
  providers: [EnrollmentScheduleService],
  imports: [TypeOrmModule.forFeature([EnrollmentSchedule, Year])],
  exports: [EnrollmentScheduleService],
})
export class EnrollmentScheduleModule {}
