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

@Module({
  controllers: [EmailsController],
  providers: [EmailsService],
  imports: [
    TypeOrmModule.forFeature([Email, ActivityClassroom, Enrollment, Family]),
    ConfigModule,
    HttpModule,
  ],
  exports: [TypeOrmModule],
})
export class EmailsModule {}
