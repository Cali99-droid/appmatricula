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
import { EnrollmentProcessor } from './enrollment.processor';
import { TreasuryModule } from 'src/treasury/treasury.module';
import { SectionHistory } from './entities/section-history';
import { EnrollmentScheduleModule } from 'src/enrollment_schedule/enrollment_schedule.module';
import { BullModule } from '@nestjs/bull';
import { EmailsModule } from 'src/emails/emails.module';

@Module({
  controllers: [EnrollmentController],
  providers: [EnrollmentService, EnrollmentScheduler, EnrollmentProcessor],
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
    EmailsModule,
    BullModule.registerQueue({
      name: 'enrollment',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100, // Mantener últimos 100 jobs completados
        removeOnFail: 50, // Mantener últimos 50 jobs fallidos
      },
    }),
  ],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
