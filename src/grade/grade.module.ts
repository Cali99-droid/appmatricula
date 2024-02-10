import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';
import { Grade } from './entities/grade.entity';

@Module({
  controllers: [GradeController],
  providers: [GradeService],
  imports: [TypeOrmModule.forFeature([Grade])],
})
export class GradeModule {}
