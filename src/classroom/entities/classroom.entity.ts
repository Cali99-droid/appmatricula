import { ApiProperty } from '@nestjs/swagger';

import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Section } from '../enum/section.enum';
import { SchoolShift } from 'src/school_shifts/entities/school_shift.entity';

import { Phase } from 'src/phase/entities/phase.entity';

@Entity()
export class Classroom {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column('int')
  capacity: number;

  @ApiProperty()
  @Column('varchar', { nullable: true, unique: true })
  code?: string;

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

  @ApiProperty({
    example: 'P (presencial)',
    description:
      'optional, type of classroom, must be P (presencial) or V (virtual)',
  })
  @Column('varchar', {
    default: 'P',
  })
  modality: string;

  @ApiProperty({
    example: '1',
    description: 'optional, 1: active, 0 inactive',
  })
  @Column('boolean', { default: '1' })
  status?: boolean;

  @ManyToOne(() => CampusDetail, (campusDetail) => campusDetail.classroom, {
    eager: true,
  })
  @JoinColumn({ name: 'campusDetailId' })
  campusDetail: CampusDetail;

  @ManyToOne(() => Grade, (grade) => grade.classroom, {
    eager: true,
  })
  @JoinColumn({ name: 'gradeId' })
  grade: Grade;

  @ManyToOne(() => SchoolShift, (shift) => shift.classroom, {
    eager: true,
  })
  @JoinColumn({ name: 'schoolShiftId' })
  schoolShift: SchoolShift;

  @ManyToOne(() => Phase, (phase) => phase.classroom, { eager: true })
  phase: Phase;
}
