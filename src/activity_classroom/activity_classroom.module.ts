import { Module } from '@nestjs/common';
import { ActivityClassroomService } from './activity_classroom.service';
import { ActivityClassroomController } from './activity_classroom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityClassroom } from './entities/activity_classroom.entity';

@Module({
  controllers: [ActivityClassroomController],
  providers: [ActivityClassroomService],
  imports: [TypeOrmModule.forFeature([ActivityClassroom])],
  exports: [TypeOrmModule],
})
export class ActivityClassroomModule {}
