import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { Student } from '../student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { Relationship } from 'src/relationship/entities/relationship.entity';
import { Family } from 'src/family/entities/family.entity';

import { EnrollmentSchedule } from 'src/enrollment_schedule/entities/enrollment_schedule.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { ActivityClassroomModule } from 'src/activity_classroom/activity_classroom.module';

@Module({
  controllers: [PersonController],
  providers: [PersonService],
  imports: [
    TypeOrmModule.forFeature([
      Person,
      Student,
      User,
      Relationship,
      Family,
      Student,
      EnrollmentSchedule,
      Attendance,
    ]),
    ConfigModule,
    ActivityClassroomModule,
  ],
  exports: [PersonService, PersonModule],
})
export class PersonModule {}
