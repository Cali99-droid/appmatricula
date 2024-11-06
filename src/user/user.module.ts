import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from 'src/person/entities/person.entity';
import { User } from './entities/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/role/entities/role.entity';
import { Assignment } from './entities/assignments.entity';

import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { AssignmentClassroom } from './entities/assignments-classroom.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Person,
      Permission,
      Role,
      Assignment,
      CampusDetail,
      AssignmentClassroom,
      Enrollment,
    ]),
  ],
  exports: [UserService, UserModule],
})
export class UserModule {}
