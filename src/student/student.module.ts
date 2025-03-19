import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from 'src/person/entities/person.entity';
import { Student } from './entities/student.entity';
import { ConfigModule } from '@nestjs/config';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { ActivityClassroomModule } from 'src/activity_classroom/activity_classroom.module';
import { StudentHistory } from './entities/student_history';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [
    TypeOrmModule.forFeature([Person, Student, Enrollment, StudentHistory]),
    ConfigModule,
    ActivityClassroomModule,
  ],
  exports: [StudentService],
})
export class StudentModule {}
