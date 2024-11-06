import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { PdfService } from './pdf.service';
import { ConfigModule } from '@nestjs/config';
import { Student } from 'src/student/entities/student.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { User } from 'src/user/entities/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { HttpModule } from '@nestjs/axios';
import { Family } from 'src/family/entities/family.entity';
import { Person } from 'src/person/entities/person.entity';

@Module({
  controllers: [DocsController],
  providers: [DocsService, PdfService],
  imports: [
    TypeOrmModule.forFeature([
      ActivityClassroom,
      Enrollment,
      User,
      Permission,
      Family,
      Person,
      Student,
    ]),
    HttpModule,
    ConfigModule,
  ],
  exports: [TypeOrmModule],
})
export class DocsModule {}
