import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Student } from 'src/student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SectionHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  sub: string;

  @ManyToOne(() => ActivityClassroom, (ac) => ac.currentClassroom, {
    eager: true,
  })
  @JoinColumn({ name: 'currentClassroomId' })
  currentClassroom?: ActivityClassroom;

  @ManyToOne(() => ActivityClassroom, (ac) => ac.previousClassroom, {
    eager: true,
  })
  @JoinColumn({ name: 'previousClassroomId' })
  previousClassroom?: ActivityClassroom;

  @ApiProperty({
    description: 'Id of Student',
  })
  @ManyToOne(() => Student, (student) => student.enrollment, {
    eager: true,
  })
  @JoinColumn({ name: 'studentId' })
  student?: Student;
  @ApiProperty({
    description: 'Id of user',
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user' })
  user?: User;

  /**TIMESTAMPS */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    select: true,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    select: false,
  })
  updatedAt: Date;
}
