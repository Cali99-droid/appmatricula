import { Module } from '@nestjs/common';
import { CampusXLevelService } from './campus_x_level.service';
import { CampusXLevelController } from './campus_x_level.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusXLevel } from './entities/campus_x_level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CampusXLevel])],
  controllers: [CampusXLevelController],
  providers: [CampusXLevelService],
  exports: [TypeOrmModule],
})
export class CampusXLevelModule {}
