import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course } from './entities/course.entity';
import { Competency } from '../competency/entities/competency.entity';
import { ActivityCourse } from './entities/activityCourse.entity';
import { Area } from '../area/entities/area.entity';
import { Level } from 'src/level/entities/level.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Phase } from 'src/phase/entities/phase.entity';

@Module({
  controllers: [CourseController],
  providers: [CourseService],
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Competency,
      ActivityCourse,
      Grade,
      Area,
      Level,
      ActivityClassroom,
      Phase,
    ]),
  ],
})
export class CourseModule {}
