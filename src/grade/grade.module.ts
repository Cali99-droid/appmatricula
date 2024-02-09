import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';
import { Grade as gradeEntity } from './entities/grade.entity';
@Module({
  imports: [TypeOrmModule.forFeature([gradeEntity])],
  controllers: [GradeController],
  providers: [GradeService],
  exports: [TypeOrmModule],
})
export class GradeModule {}
