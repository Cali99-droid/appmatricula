import { ApiProperty } from '@nestjs/swagger';

import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Classroom } from '../../classroom/entities/classroom.entity';
import { Phase } from '../../phase/entities/phase.entity';
import { Section } from '../../activity_classroom/enum/section.enum';
import { Grade } from '../../grade/entities/grade.entity';
import { SchoolShift } from '../../school_shifts/entities/school_shift.entity';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { AssignmentClassroom } from 'src/user/entities/assignments-classroom.entity';
import { Ascent } from 'src/enrollment/entities/ascent.entity';
import { SectionHistory } from 'src/enrollment/entities/section-history';
import { Course } from 'src/academic_structure/course/entities/course.entity';

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

  @OneToMany(() => Schedule, (schedule) => schedule.activityClassroom)
  schedule?: Schedule[];

  @OneToMany(() => Attendance, (attendance) => attendance.activityClassroom)
  attendance?: Attendance[];

  @OneToMany(
    () => AssignmentClassroom,
    (assignmentClass) => assignmentClass.activityClassroom,
  )
  assignmentClassroom: AssignmentClassroom[];

  /**ascent */
  @OneToMany(() => Ascent, (acen) => acen.originId)
  origin?: Ascent;
  @OneToMany(() => Ascent, (acen) => acen.destinationId)
  destination?: Ascent;
  /**history SEction */
  @OneToMany(() => SectionHistory, (sh) => sh.currentClassroom)
  currentClassroom?: SectionHistory;
  @OneToMany(() => SectionHistory, (sh) => sh.previousClassroom)
  previousClassroom?: SectionHistory;
  @OneToMany(() => Course, (sh) => sh.activityClassroom)
  course?: Course[];
}
