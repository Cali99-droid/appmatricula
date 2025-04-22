import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusService } from './campus.service';
import { CampusController } from './campus.controller';
import { Campus } from './entities/campus.entity';
import { CampusDetailService } from 'src/campus_detail/campus_detail.service';
import { CampusDetailModule } from 'src/campus_detail/campus_detail.module';
import { YearsModule } from 'src/years/years.module';
import { YearsService } from 'src/years/years.service';
import { LevelService } from 'src/level/level.service';
import { LevelModule } from 'src/level/level.module';
import { CampusToLevel } from './entities/campusToLevel.entity';
import { User } from 'src/user/entities/user.entity';
import { Assignment } from 'src/user/entities/assignments.entity';

@Module({
  controllers: [CampusController],
  providers: [CampusService, CampusDetailService, YearsService, LevelService],
  imports: [
    TypeOrmModule.forFeature([Campus, CampusToLevel, User, Assignment]),
    CampusDetailModule,
    YearsModule,
    LevelModule,
  ],
  exports: [TypeOrmModule],
})
export class CampusModule {}
