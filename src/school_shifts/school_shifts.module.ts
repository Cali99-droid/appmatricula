import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolShiftsService } from './school_shifts.service';
import { SchoolShiftsController } from './school_shifts.controller';
import { SchoolShift } from './entities/school_shift.entity';

@Module({
  controllers: [SchoolShiftsController],
  providers: [SchoolShiftsService],
  imports: [TypeOrmModule.forFeature([SchoolShift])],
})
export class SchoolShiftsModule {}
