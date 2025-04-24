import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyService } from './competency.service';
import { CompetencyController } from './competency.controller';
import { Competency } from './entities/competency.entity';

@Module({
  controllers: [CompetencyController],
  providers: [CompetencyService],
  imports: [TypeOrmModule.forFeature([Competency])],
})
export class CompetencyModule {}
