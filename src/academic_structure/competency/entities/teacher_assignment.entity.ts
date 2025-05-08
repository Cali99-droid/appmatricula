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
import { User } from 'src/user/entities/user.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Area } from 'src/academic_structure/area/entities/area.entity';
import { Course } from 'src/academic_structure/course/entities/course.entity';

@Entity()
export class TeacherAssignment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'true',
    description: 'if the teacher is tutor',
  })
  @Column('bool', {
    default: false,
  })
  isTutor: boolean;

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => Area, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'areaId' })
  area?: Area;

  @ManyToOne(() => Course, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'courseId' })
  course?: Course;

  @ManyToOne(() => ActivityClassroom, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'activityClassroomId' })
  activityClassroom?: ActivityClassroom;

  //   @ManyToOne(() => Phase, {
  //     eager: true,
  //     nullable: true,
  //   })
  //   @JoinColumn({ name: 'phaseId' })
  //   phase?: Phase;

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
