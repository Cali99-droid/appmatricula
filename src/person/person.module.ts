import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { Student } from '../student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { Relationship } from 'src/relationship/entities/relationship.entity';

@Module({
  controllers: [PersonController],
  providers: [PersonService],
  imports: [
    TypeOrmModule.forFeature([Person, Student, User, Relationship]),
    ConfigModule,
  ],
})
export class PersonModule {}
