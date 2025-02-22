import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Email } from './entities/email.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Family } from 'src/family/entities/family.entity';
import { HttpModule } from '@nestjs/axios';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { EmailDetail } from './entities/emailDetail.entity';

@Module({
  controllers: [EmailsController],
  providers: [EmailsService],
  imports: [
    TypeOrmModule.forFeature([
      Email,
      ActivityClassroom,
      Enrollment,
      Family,
      Person,
      Student,
      EmailDetail,
    ]),
    ConfigModule,
    HttpModule,
  ],
  exports: [TypeOrmModule, EmailsService],
})
export class EmailsModule {}
