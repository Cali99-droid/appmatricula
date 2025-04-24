import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { CourseService } from '../course.service';
// import { CourseController } from './course.controller';
import { Course } from './entities/course.entity';

@Module({
  // controllers: [CourseController],
  // providers: [CourseService],
  imports: [TypeOrmModule.forFeature([Course])],
})
export class CourseModule {}
