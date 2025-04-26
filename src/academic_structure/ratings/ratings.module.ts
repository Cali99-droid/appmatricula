import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { Ratings } from './entities/ratings.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService],
  imports: [TypeOrmModule.forFeature([Ratings, User])],
})
export class RatingsModule {}
