import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusService } from './campus.service';
import { CampusController } from './campus.controller';
import { Campus } from './entities/campus.entity';
import { CampusDetailService } from 'src/campus_detail/campus_detail.service';
import { CampusDetailModule } from 'src/campus_detail/campus_detail.module';
import { LevelModule } from 'src/level/level.module';
import { YearsModule } from 'src/years/years.module';
import { LevelService } from 'src/level/level.service';
import { YearsService } from 'src/years/years.service';

@Module({
  controllers: [CampusController],
  providers: [CampusService, CampusDetailService, LevelService, YearsService],
  imports: [
    TypeOrmModule.forFeature([Campus]),
    CampusDetailModule,
    LevelModule,
    YearsModule,
  ],
  exports: [TypeOrmModule],
})
export class CampusModule {}
