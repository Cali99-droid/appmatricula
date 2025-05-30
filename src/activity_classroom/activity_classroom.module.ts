import { Module } from '@nestjs/common';
import { ActivityClassroomService } from './activity_classroom.service';
import { ActivityClassroomController } from './activity_classroom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityClassroom } from './entities/activity_classroom.entity';
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';

import { Ascent } from 'src/enrollment/entities/ascent.entity';

@Module({
  controllers: [ActivityClassroomController],
  providers: [ActivityClassroomService],
  imports: [
    TypeOrmModule.forFeature([ActivityClassroom, User, Ascent]),
    ConfigModule,
  ],
  exports: [TypeOrmModule, ActivityClassroomService],
})
export class ActivityClassroomModule {}
