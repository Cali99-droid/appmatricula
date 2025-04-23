import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { AreaAssignmentsService } from './areaassignments.service';
// import { AreaAssignmentsController } from './area_assignments.controller';
import { AreaAssignments } from './entities/area_assignments.entity';

@Module({
  // controllers: [AreaAssignmentsController],
  // providers: [AreaAssignmentsService],
  imports: [TypeOrmModule.forFeature([AreaAssignments])],
})
export class AreaAssignmentsModule {}
