import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusXLevelGradeService } from './campus_x_level_grade.service';
import { CampusXLevelGradeController } from './campus_x_level_grade.controller';
import { CampusXLevelGrade } from './entities/campus_x_level_grade.entity';

@Module({
  controllers: [CampusXLevelGradeController],
  providers: [CampusXLevelGradeService],
  imports: [TypeOrmModule.forFeature([CampusXLevelGrade])],
})
export class CampusXLevelGradeModule {}
