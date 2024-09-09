import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { Family } from './entities/family.entity';
import { Student } from 'src/student/entities/student.entity';
import { Person } from 'src/person/entities/person.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relationship } from 'src/relationship/entities/relationship.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [FamilyController],
  providers: [FamilyService],
  imports: [
    TypeOrmModule.forFeature([Person, Student, Family, Relationship]),
    HttpModule,
    ConfigModule,
  ],
  exports: [TypeOrmModule],
})
export class FamilyModule {}
