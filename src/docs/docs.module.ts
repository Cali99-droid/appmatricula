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

@Module({
  controllers: [DocsController],
  providers: [DocsService, PdfService],
  imports: [
    TypeOrmModule.forFeature([
      ActivityClassroom,
      Student,
      Enrollment,
      User,
      Permission,
    ]),
    ConfigModule,
  ],
})
export class DocsModule {}
