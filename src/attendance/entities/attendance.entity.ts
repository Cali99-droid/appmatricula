import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Student } from 'src/student/entities/student.entity';
import { Shift } from '../enum/shift.enum';
import { ConditionAttendance } from '../enum/condition.enum';
import { TypeSchedule } from '../enum/type-schedule.enum';

@Entity()
export class Attendance {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('datetime')
  arrivalTime: Date;

  @Column('date', {
    nullable: true,
  })
  arrivalDate: Date;

  // @Column({ type: 'enum', enum: StatusAttendance })
  // status: StatusAttendance;

  @Column({
    type: 'enum',
    enum: TypeSchedule,
    nullable: true,
    default: TypeSchedule.General,
  })
  typeSchedule: TypeSchedule;

  @Column({ type: 'enum', enum: ConditionAttendance })
  condition: ConditionAttendance;

  @Column({ type: 'enum', enum: Shift })
  shift: Shift;

  @ManyToOne(() => Student, (student) => student.attendance, {
    eager: true,
  })
  @JoinColumn({ name: 'studentId' })
  student?: Student;

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
  // @ManyToOne(
  //   () => ActivityClassroom,
  //   (activityClassroom) => activityClassroom.attendance,
  //   {
  //     eager: true,
  //   },
  // )
  // @JoinColumn({ name: 'activityClassroomId' })
  // activityClassroom?: ActivityClassroom;
}
