import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Student } from 'src/student/entities/student.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TransferRequest } from './entities/transfer-request.entity';
import { TransfersController } from './transfer.controller';
import { TransfersService } from './transfer.service';
import { UserModule } from 'src/user/user.module';
import { TransferReport } from './entities/transfer-report.entity';
import { TransferMeeting } from './entities/transfer-meeting.entity';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { TreasuryModule } from 'src/treasury/treasury.module';
import { EmailsModule } from 'src/emails/emails.module';
import { PersonModule } from 'src/person/person.module';
import { ActivityClassroomModule } from 'src/activity_classroom/activity_classroom.module';
import { TransferRequestTracking } from './entities/transfer-resquest-tracking.entity';

@Module({
  controllers: [TransfersController],
  providers: [TransfersService],
  imports: [
    TypeOrmModule.forFeature([
      Student,
      TransferRequest,
      TransferReport,
      TransferMeeting,
      TransferRequestTracking,
    ]),
    HttpModule,
    ConfigModule,
    UserModule,
    EnrollmentModule,
    TreasuryModule,
    EmailsModule,
    PersonModule,
    ActivityClassroomModule,
  ],
  exports: [TypeOrmModule],
})
export class TransfersModule {}
