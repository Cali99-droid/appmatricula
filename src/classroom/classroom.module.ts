import { Global, Module } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';
import { Classroom } from './entities/classroom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhaseToClassroom } from 'src/phase/entities/phaseToClassroom.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Classroom, PhaseToClassroom])],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService, TypeOrmModule],
})
export class ClassroomModule {}
