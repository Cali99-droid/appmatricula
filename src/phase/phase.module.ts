import { Module } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { PhaseController } from './phase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phase } from './entities/phase.entity';
import { Year } from 'src/years/entities/year.entity';
import { PhaseToClassroom } from './entities/phaseToClassroom.entity';
import { ClassroomModule } from 'src/classroom/classroom.module';

@Module({
  controllers: [PhaseController],
  providers: [PhaseService],
  imports: [
    ClassroomModule,
    TypeOrmModule.forFeature([Phase, Year, PhaseToClassroom]),
  ],
})
export class PhaseModule {}
