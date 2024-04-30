import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { Attendance } from './entities/attendance.entity';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
  imports: [TypeOrmModule.forFeature([Student, Attendance])],
})
export class AttendanceModule {}
