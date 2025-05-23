import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ratings } from 'src/academic_structure/ratings/entities/ratings.entity';

import { ActivityCourse } from './activityCourse.entity';
import { Area } from 'src/academic_structure/area/entities/area.entity';

@Entity()
export class Course {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'ALGEBRA',
    description: 'Name of area',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: false,
  })
  name: string;

  @ApiProperty({
    example: 'true',
    description: 'status of the area',
  })
  @Column('bool', {
    default: true,
  })
  status: boolean;

  @ManyToOne(() => Area, (area) => area.course, { eager: true })
  area: Area;

  // @ApiProperty({
  //   example: 'true',
  //   description: 'status of the area',
  // })
  // @Column('bool', {
  //   default: true,
  // })
  // isForAllClassrooms: boolean;

  @OneToMany(() => ActivityCourse, (activityCourse) => activityCourse.course, {
    eager: true,
  })
  activityCourse: ActivityCourse[];

  // @ManyToOne(
  //   () => ActivityClassroom,
  //   (activityClassroom) => activityClassroom.course,
  //   {
  //     eager: true,
  //     nullable: true,
  //   },
  // )
  // @JoinColumn({ name: 'activityClassroomId' })
  // activityClassroom?: ActivityClassroom;

  // @ManyToMany(() => ActivityClassroom, (ac) => ac.courses)
  // @JoinTable({
  //   name: 'course_classroom',
  //   joinColumn: { name: 'cuorse_id' },
  //   inverseJoinColumn: { name: 'activityClassroomId' },
  // })
  // activityClassrooms: ActivityClassroom[];

  @OneToMany(() => Ratings, (ratings) => ratings.course, {
    // eager: true,
  })
  ratings?: Ratings[];

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
