import { Module } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { PhaseController } from './phase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phase } from './entities/phase.entity';
import { Year } from 'src/years/entities/year.entity';

@Module({
  controllers: [PhaseController],
  providers: [PhaseService],
  imports: [TypeOrmModule.forFeature([Phase, Year])],
})
export class PhaseModule {}
