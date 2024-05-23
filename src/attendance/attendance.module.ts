import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { Attendance } from './entities/attendance.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Holiday } from 'src/holiday/entities/holiday.entity';
import { AttendanceScheduler } from './schedule/AttendanceScheduler';
import { ScheduleModule } from '@nestjs/schedule';
import { Phase } from 'src/phase/entities/phase.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceScheduler],
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Attendance,
      Enrollment,
      Schedule,
      Holiday,
      Phase,
      ActivityClassroom,
    ]),
    ScheduleModule.forRoot(),
  ],
})
export class AttendanceModule {}
