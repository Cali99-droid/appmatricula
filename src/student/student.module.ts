import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from 'src/person/entities/person.entity';
import { Student } from './entities/student.entity';
import { ConfigModule } from '@nestjs/config';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [
    TypeOrmModule.forFeature([Person, Student, Enrollment]),
    ConfigModule,
  ],
  exports: [StudentService],
})
export class StudentModule {}
