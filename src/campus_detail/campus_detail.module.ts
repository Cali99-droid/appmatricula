import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusDetailService } from './campus_detail.service';
import { CampusDetailController } from './campus_detail.controller';
import { CampusDetail } from './entities/campus_detail.entity';

@Module({
  controllers: [CampusDetailController],
  providers: [CampusDetailService],
  imports: [TypeOrmModule.forFeature([CampusDetail])],
})
export class CampusDetailModule {}
