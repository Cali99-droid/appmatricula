import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusService } from './campus.service';
import { CampusController } from './campus.controller';
import { Campus } from './entities/campus.entity';

@Module({
  controllers: [CampusController],
  providers: [CampusService],
  imports: [TypeOrmModule.forFeature([Campus])],
})
export class CampusModule {}
