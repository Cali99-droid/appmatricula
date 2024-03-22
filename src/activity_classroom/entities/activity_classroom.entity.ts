import { ApiProperty } from '@nestjs/swagger';
import { Classroom } from 'src/classroom/entities/classroom.entity';
import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Phase } from 'src/phase/entities/phase.entity';
import { Section } from '../../activity_classroom/enum/section.enum';
import { Grade } from 'src/grade/entities/grade.entity';
import { SchoolShift } from 'src/school_shifts/entities/school_shift.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
@Entity()
export class ActivityClassroom {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'A',
    description:
      'optional, section of classroom, must be a letter uppercase of alphabet',
  })
  @Column({
    type: 'enum',
    enum: Section,
  })
  section: Section;
  // @Column()
  // public order: number
  @ManyToOne(() => Classroom, (classroom) => classroom.activityClassroom, {
    eager: true,
  })
  @JoinColumn({ name: 'classroomId' })
  classroom?: Classroom;
  @ManyToOne(() => Grade, (grade) => grade.activityClassroom, {
    eager: true,
  })
  @JoinColumn({ name: 'gradeId' })
  grade: Grade;

  @ManyToOne(() => Phase, (phase) => phase.activityClassroom, {
    cascade: true,

    eager: true,
  })
  @JoinColumn({ name: 'phaseId' })
  phase?: Phase;
  @ManyToOne(() => SchoolShift, (shift) => shift.activityClassroom, {
    eager: true,
  })
  @JoinColumn({ name: 'schoolShiftId' })
  schoolShift: SchoolShift;
  @OneToMany(() => Enrollment, (enrollment) => enrollment.activityClassroom)
  enrollment?: Enrollment[];
}
