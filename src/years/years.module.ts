import { Module } from '@nestjs/common';
import { YearsService } from './years.service';
import { YearsController } from './years.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Year } from './entities/year.entity';

@Module({
  controllers: [YearsController],
  providers: [YearsService],
  imports: [TypeOrmModule.forFeature([Year])],
})
export class YearsModule {}
