import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusService } from './campus.service';
import { CampusController } from './campus.controller';
import { Campus } from './entities/campus.entity';
import { CampusDetailService } from 'src/campus_detail/campus_detail.service';
import { CampusDetailModule } from 'src/campus_detail/campus_detail.module';
import { YearsModule } from 'src/years/years.module';
import { YearsService } from 'src/years/years.service';
import { CampusXLevelService } from 'src/campus_x_level/campus_x_level.service';
import { CampusXLevelModule } from 'src/campus_x_level/campus_x_level.module';
import { LevelService } from 'src/level/level.service';
import { LevelModule } from 'src/level/level.module';

@Module({
  controllers: [CampusController],
  providers: [
    CampusService,
    CampusDetailService,
    CampusXLevelService,
    YearsService,
    LevelService,
  ],
  imports: [
    TypeOrmModule.forFeature([Campus]),
    CampusDetailModule,
    CampusXLevelModule,
    YearsModule,
    LevelModule,
  ],
  exports: [TypeOrmModule],
})
export class CampusModule {}
