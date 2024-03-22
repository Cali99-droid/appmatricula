import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
} from 'typeorm';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Student } from 'src/person/entities/student.entity';
import { Status } from '../enum/status.enum';
@Entity()
export class Enrollment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

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
    description: 'gender, must be EN PROCESO, TRASLADADO  or DEFINITIVA',
  })
  @Column({ enum: Status })
  status: string;
}
