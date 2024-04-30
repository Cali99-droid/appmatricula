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

@Entity()
export class Attendance {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('datetime')
  date: string;

  @Column({ type: 'enum', enum: StatusAttendance })
  status: StatusAttendance;

  @Column('varchar')
  shift: string;

  @ManyToOne(() => Student, (student) => student.attendance, {
    eager: true,
  })
  @JoinColumn({ name: 'studentId' })
  student?: Student;
}
