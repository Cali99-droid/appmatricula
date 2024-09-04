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
    ]),
    StudentModule,
  ],
})
export class EnrollmentModule {}
