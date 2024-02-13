import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusDetailService } from './campus_detail.service';
import { CampusDetailController } from './campus_detail.controller';
import { CampusDetail } from './entities/campus_detail.entity';
import { CampusService } from 'src/campus/campus.service';

@Module({
  controllers: [CampusDetailController],
  providers: [CampusDetailService],
  imports: [TypeOrmModule.forFeature([CampusDetail])],
  exports: [TypeOrmModule, CampusService, CampusDetailService],
})
export class CampusDetailModule {}
