import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatusAttendance } from '../enum/status-attendance.enum';
import { Student } from 'src/student/entities/student.entity';
import { Shift } from '../enum/shift.enum';

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

  @Column({ type: 'enum', enum: StatusAttendance })
  status: StatusAttendance;

  @Column({ type: 'enum', enum: Shift })
  shift: Shift;

  @ManyToOne(() => Student, (student) => student.attendance, {
    eager: true,
  })
  @JoinColumn({ name: 'studentId' })
  student?: Student;

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
