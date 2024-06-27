import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { Family } from './entities/family.entity';
import { Student } from 'src/student/entities/student.entity';
import { Person } from 'src/person/entities/person.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relationship } from 'src/relationship/entities/relationship.entity';

@Module({
  controllers: [FamilyController],
  providers: [FamilyService],
  imports: [TypeOrmModule.forFeature([Person, Student, Family, Relationship])],
})
export class FamilyModule {}
