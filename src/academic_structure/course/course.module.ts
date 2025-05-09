import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course } from './entities/course.entity';
import { CourseDetail } from './entities/course_detail.entity';
import { Competency } from '../competency/entities/competency.entity';

@Module({
  controllers: [CourseController],
  providers: [CourseService],
  imports: [TypeOrmModule.forFeature([Course, CourseDetail, Competency])],
})
export class CourseModule {}
