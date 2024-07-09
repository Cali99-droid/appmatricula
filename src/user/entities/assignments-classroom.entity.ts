import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';

@Entity()
export class AssignmentClassroom {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.assignmentsClassroom)
  user: User;

  @ManyToOne(() => ActivityClassroom, (ac) => ac.assignmentClassroom)
  activityClassroom: ActivityClassroom;
}
