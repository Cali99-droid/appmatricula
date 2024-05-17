import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { Attendance } from './entities/attendance.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Holiday } from 'src/holiday/entities/holiday.entity';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Attendance,
      Enrollment,
      Schedule,
      Holiday,
    ]),
  ],
})
export class AttendanceModule {}
