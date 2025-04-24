import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Competency } from './competency.entity';
import { User } from 'src/user/entities/user.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Phase } from 'src/phase/entities/phase.entity';

@Entity()
export class TeacherAssignment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => Competency, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'competencyId' })
  competency?: Competency;

  @ManyToOne(() => ActivityClassroom, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'activityClassroomId' })
  activityClassroom?: ActivityClassroom;

  //   @ManyToOne(() => Phase, {
  //     eager: true,
  //     nullable: true,
  //   })
  //   @JoinColumn({ name: 'phaseId' })
  //   phase?: Phase;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
