import { Module } from '@nestjs/common';
import { AcademicAssignmentService } from './academic_assignment.service';
import { AcademicAssignmentController } from './academic_assignment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityCourse } from '../course/entities/activityCourse.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Area } from '../area/entities/area.entity';
import { User } from 'src/user/entities/user.entity';
import { AcademicAssignment } from './entities/academic_assignment.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AcademicAssignmentController],
  providers: [AcademicAssignmentService],
  imports: [
    TypeOrmModule.forFeature([
      AcademicAssignment,
      ActivityCourse,
      ActivityClassroom,
      Area,
      User,
      ConfigModule,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class AcademicAssignmentModule {}
