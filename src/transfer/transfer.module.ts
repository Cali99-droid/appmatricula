import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';
import { Student } from 'src/student/entities/student.entity';
import { Concept } from 'src/treasury/entities/concept.entity';
import { Debt } from 'src/treasury/entities/debt.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [TransferController],
  providers: [TransferService],
  imports: [
    TypeOrmModule.forFeature([Transfer, Student, Concept, Debt]),
    HttpModule,
    ConfigModule,
  ],
  exports: [TypeOrmModule],
})
export class TransfersModule {}
