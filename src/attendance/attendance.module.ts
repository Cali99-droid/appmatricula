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

import { DayOfWeek } from 'src/day_of_week/entities/day_of_week.entity';
import { Person } from 'src/person/entities/person.entity';
import { Relationship } from 'src/relationship/entities/relationship.entity';
import { HttpModule } from '@nestjs/axios';
import { Family } from 'src/family/entities/family.entity';
import { UserModule } from 'src/user/user.module';
import { EmailsModule } from 'src/emails/emails.module';
import { SlackService } from 'src/enrollment/slack.service';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';

@Module({
  controllers: [AttendanceController],

  providers: [AttendanceService, AttendanceScheduler, SlackService],
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

      DayOfWeek,
      Person,
      Relationship,
      Family,
    ]),
    UserModule,
    ConfigModule,
    HttpModule,
    EmailsModule,
    EnrollmentModule,
    ScheduleModule.forRoot(),
  ],
})
export class AttendanceModule {}
