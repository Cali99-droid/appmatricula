import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
} from 'typeorm';
import { ActivityClassroom } from '../../activity_classroom/entities/activity_classroom.entity';
import { Student } from '../../student/entities/student.entity';
import { Status } from '../enum/status.enum';
import { Behavior } from '../enum/behavior.enum';
@Entity()
export class Enrollment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    unique: true,
    nullable: true,
  })
  code: string;

  @Column('boolean', {
    default: true,
  })
  ratified: boolean;

  @ApiProperty({
    description: 'Id of Student',
  })
  @ManyToOne(() => Student, (student) => student.enrollment, {
    eager: true,
  })
  @JoinColumn({ name: 'studentId' })
  student?: Student;

  @ApiProperty({
    description: 'Id of ActivityClassroom',
  })
  @ManyToOne(() => ActivityClassroom, (classroom) => classroom.enrollment, {
    eager: true,
  })
  @JoinColumn({ name: 'activityClassroomId' })
  activityClassroom?: ActivityClassroom;

  @ApiProperty({
    example: 'EN PROCESO',
    description: 'status, must be EN PROCESO, TRASLADADO  or DEFINITIVA',
  })
  @Column({ type: 'enum', enum: Status })
  status: Status;

  @ApiProperty({
    example: 'NORMAL',
    default: 'normal',
    description:
      'status, must be normal, MATRICULA_CONDICIONADA  or PERDIDA_VACANTE',
  })
  @Column({ type: 'enum', enum: Behavior })
  behavior: Behavior;

  @Column('varchar', {
    unique: true,
    nullable: true,
  })
  behaviorDescription: string;

  @ApiProperty({
    example: '1',
    description: 'optional, 1: active, 0 inactive',
  })
  @Column('boolean', { default: '1' })
  isActive?: boolean;
}
