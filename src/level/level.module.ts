import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level as levelEntity } from './entities/level.entity';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';

@Module({
  imports: [TypeOrmModule.forFeature([levelEntity])],
  providers: [LevelService],
  controllers: [LevelController],
  exports: [TypeOrmModule],
})
export class LevelModule {}
