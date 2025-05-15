import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course } from './entities/course.entity';
import { Competency } from '../competency/entities/competency.entity';
import { ActivityCourse } from './entities/activityCourse.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Area } from '../area/entities/area.entity';
import { Level } from 'src/level/entities/level.entity';

@Module({
  controllers: [CourseController],
  providers: [CourseService],
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Competency,
      ActivityCourse,
      ActivityClassroom,
      Area,
      Level,
    ]),
  ],
})
export class CourseModule {}
