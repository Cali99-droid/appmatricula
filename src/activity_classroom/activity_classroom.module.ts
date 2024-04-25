import { Module } from '@nestjs/common';
import { ActivityClassroomService } from './activity_classroom.service';
import { ActivityClassroomController } from './activity_classroom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityClassroom } from './entities/activity_classroom.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [ActivityClassroomController],
  providers: [ActivityClassroomService],
  imports: [TypeOrmModule.forFeature([ActivityClassroom]), ConfigModule],
  exports: [TypeOrmModule],
})
export class ActivityClassroomModule {}
