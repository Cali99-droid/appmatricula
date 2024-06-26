import { Module } from '@nestjs/common';
import { YearsService } from './years.service';
import { YearsController } from './years.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Year } from './entities/year.entity';
import { Campus } from '../campus/entities/campus.entity';

@Module({
  controllers: [YearsController],
  providers: [YearsService],
  imports: [TypeOrmModule.forFeature([Year, Campus])],
  exports: [TypeOrmModule],
})
export class YearsModule {}
