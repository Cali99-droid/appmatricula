import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';

import { StudentModule } from 'src/student/student.module';
import { Ascent } from './entities/ascent.entity';
import { User } from 'src/user/entities/user.entity';
import { Rates } from 'src/treasury/entities/rates.entity';
import { Debt } from 'src/treasury/entities/debt.entity';
import { FamilyModule } from 'src/family/family.module';
import { ConfigModule } from '@nestjs/config';
import { EnrollmentScheduler } from './schedule/enrollment.scheduler';

import { TreasuryModule } from 'src/treasury/treasury.module';
import { SectionHistory } from './entities/section-history';
import { EnrollmentScheduleModule } from 'src/enrollment_schedule/enrollment_schedule.module';

@Module({
  controllers: [EnrollmentController],
  providers: [EnrollmentService, EnrollmentScheduler],
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      Person,
      Student,
      ActivityClassroom,
      Ascent,
      User,

      Rates,
      Debt,
      SectionHistory,
    ]),
    StudentModule,
    FamilyModule,
    ConfigModule,
    TreasuryModule,
    EnrollmentScheduleModule,
  ],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
