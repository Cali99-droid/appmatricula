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
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { DayOfWeek } from 'src/day_of_week/entities/day_of_week.entity';
import { Person } from 'src/person/entities/person.entity';
import { Relationship } from 'src/relationship/entities/relationship.entity';
import { HttpModule } from '@nestjs/axios';

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
      User,
      Permission,
      DayOfWeek,
      Person,
      Relationship,
    ]),

    ConfigModule,
    HttpModule,

    ScheduleModule.forRoot(),
  ],
})
export class AttendanceModule {}
