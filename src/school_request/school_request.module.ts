import { Module } from '@nestjs/common';
import { SchoolRequestService } from './school_request.service';
import { SchoolRequestController } from './school_request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolRequest } from './entities/school_request.entity';
import { TreasuryModule } from 'src/treasury/treasury.module';

@Module({
  controllers: [SchoolRequestController],
  providers: [SchoolRequestService],
  imports: [TypeOrmModule.forFeature([SchoolRequest]), TreasuryModule],
})
export class SchoolRequestModule {}
