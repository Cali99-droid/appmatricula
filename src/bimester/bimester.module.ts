import { Module } from '@nestjs/common';
import { BimesterService } from './bimester.service';
import { BimesterController } from './bimester.controller';
import { Bimester } from './entities/bimester.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phase } from 'src/phase/entities/phase.entity';

@Module({
  controllers: [BimesterController],
  providers: [BimesterService],
  imports: [TypeOrmModule.forFeature([Bimester, Phase])],
})
export class BimesterModule {}
