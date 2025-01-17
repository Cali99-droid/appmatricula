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
import { Permission } from 'src/permissions/entities/permission.entity';
import { Rates } from 'src/treasury/entities/rates.entity';
import { Debt } from 'src/treasury/entities/debt.entity';
import { FamilyModule } from 'src/family/family.module';

@Module({
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      Person,
      Student,
      ActivityClassroom,
      Ascent,
      User,
      Permission,
      Rates,
      Debt,
    ]),
    StudentModule,
    FamilyModule,
  ],
})
export class EnrollmentModule {}
