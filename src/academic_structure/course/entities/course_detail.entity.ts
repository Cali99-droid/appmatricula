import { ApiProperty } from '@nestjs/swagger';
import { Competency } from 'src/academic_structure/competency/entities/competency.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity()
export class CourseDetail {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.courseDetail, {
    // eager: true,
  })
  @JoinColumn({ name: 'courseId' })
  course?: Course;

  @ManyToOne(() => Competency, (competency) => competency.courseDetail, {
    eager: true,
  })
  @JoinColumn({ name: 'competencyId' })
  competency?: Competency;

  @ApiProperty({
    example: 'true',
    description: 'status of the area',
  })
  @Column('bool', {
    default: true,
  })
  status: boolean;

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
}
