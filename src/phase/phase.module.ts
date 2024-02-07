import { Module } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { PhaseController } from './phase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phase } from './entities/phase.entity';

@Module({
  controllers: [PhaseController],
  providers: [PhaseService],
  imports: [TypeOrmModule.forFeature([Phase])],
})
export class PhaseModule {}
