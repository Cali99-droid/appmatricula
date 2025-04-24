import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyService } from './competency.service';
import { CompetencyController } from './competency.controller';
import { Competency } from './entities/competency.entity';
import { TeacherAssignment } from './entities/teacher_assignment.entity';
import { CompetencyController } from './competency.controller';
import { CompetencyService } from './competency.service';

@Module({
  controllers: [CompetencyController],
  providers: [CompetencyService],

  imports: [TypeOrmModule.forFeature([Competency, TeacherAssignment])],

})
export class CompetencyModule {}
