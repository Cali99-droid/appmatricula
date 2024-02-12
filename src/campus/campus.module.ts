import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusService } from './campus.service';
import { CampusController } from './campus.controller';
import { Campus } from './entities/campus.entity';
import { CampusDetailService } from 'src/campus_detail/campus_detail.service';
import { CampusDetailModule } from 'src/campus_detail/campus_detail.module';

@Module({
  controllers: [CampusController],
  providers: [CampusService, CampusDetailService],
  imports: [TypeOrmModule.forFeature([Campus]), CampusDetailModule],
})
export class CampusModule {}
