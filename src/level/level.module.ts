import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import { Level } from './entities/level.entity';

@Module({
  controllers: [LevelController],
  providers: [LevelService],
  imports: [TypeOrmModule.forFeature([Level])],
})
export class LevelModule {}
