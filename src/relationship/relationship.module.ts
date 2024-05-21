import { Module } from '@nestjs/common';
import { RelationshipService } from './relationship.service';
import { RelationshipController } from './relationship.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { Relationship } from './entities/relationship.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';

@Module({
  controllers: [RelationshipController],
  providers: [RelationshipService],
  imports: [
    TypeOrmModule.forFeature([Person, Student, Relationship, Enrollment]),
  ],
})
export class RelationshipModule {}
