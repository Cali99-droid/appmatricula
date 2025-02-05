import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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
    nullable: true,
  })
  behaviorDescription: string;

  @Column('varchar', {
    nullable: true,
  })
  commitmentDocumentURL: string;

  @Column('boolean', {
    default: true,
  })
  allowNextRegistration: boolean;

  @ApiProperty({
    example: '1',
    description: 'optional, 1: active, 0 inactive',
  })
  @Column('boolean', { default: '1' })
  isActive?: boolean;

  @Column('date', {
    nullable: true,
  })
  dateOfChange: Date;

  @Column('date', {
    nullable: true,
  })
  reservationExpiration: Date;

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
