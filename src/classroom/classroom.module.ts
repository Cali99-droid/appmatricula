import { Global, Module } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';
import { Classroom } from './entities/classroom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Classroom])],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService, TypeOrmModule],
})
export class ClassroomModule {}
