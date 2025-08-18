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
import { User } from 'src/user/entities/user.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';

@Module({
  controllers: [FamilyController],
  providers: [FamilyService],
  imports: [
    TypeOrmModule.forFeature([
      Person,
      Student,
      Family,
      Relationship,
      User,
      Enrollment,
    ]),
    HttpModule,
    ConfigModule,
  ],
  exports: [TypeOrmModule, FamilyService],
})
export class FamilyModule {}
