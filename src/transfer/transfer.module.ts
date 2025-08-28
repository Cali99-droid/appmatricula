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

@Module({
  controllers: [TransfersController],
  providers: [TransfersService],
  imports: [
    TypeOrmModule.forFeature([
      Student,
      TransferRequest,
      TransferReport,
      TransferMeeting,
    ]),
    HttpModule,
    ConfigModule,
    UserModule,
    EnrollmentModule,
  ],
  exports: [TypeOrmModule],
})
export class TransfersModule {}
