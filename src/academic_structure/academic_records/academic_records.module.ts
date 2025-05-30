import { Module } from '@nestjs/common';
import { AcademicRecordsService } from './academic_records.service';
import { AcademicRecordsController } from './academic_records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicRecord } from './entities/academic_record.entity';
import { AcademicAssignment } from '../academic_assignment/entities/academic_assignment.entity';
import { Student } from 'src/student/entities/student.entity';
import { ActivityClassroomModule } from 'src/activity_classroom/activity_classroom.module';
import { User } from 'src/user/entities/user.entity';
import { Bimester } from 'src/bimester/entities/bimester.entity';
import { BimesterModule } from 'src/bimester/bimester.module';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Area } from '../area/entities/area.entity';
import { DocsModule } from 'src/docs/docs.module';

@Module({
  controllers: [AcademicRecordsController],
  providers: [AcademicRecordsService],
  imports: [
    TypeOrmModule.forFeature([
      AcademicRecord,
      AcademicAssignment,
      Student,
      User,
      Bimester,
      Enrollment,
      Area,
    ]),

    ActivityClassroomModule,
    BimesterModule,
    DocsModule,
  ],
})
export class AcademicRecordsModule {}
