import { ApiProperty } from '@nestjs/swagger';
import { Area } from 'src/academic_structure/area/entities/area.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ratings } from 'src/academic_structure/ratings/entities/ratings.entity';
import { Competency } from 'src/academic_structure/competency/entities/competency.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';

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

  @ManyToOne(() => Area, (area) => area.course, {
    eager: true,
  })
  @JoinColumn({ name: 'areaId' })
  area: Area;

  @ManyToOne(() => Competency, (competency) => competency.course, {
    eager: true,
  })
  @JoinColumn({ name: 'competencyId' })
  competency?: Competency;

  // @ManyToOne(() => Year, (year) => year.course, {
  //   eager: true,
  // })
  // @JoinColumn({ name: 'yearId' })
  // year?: Year;

  // @ManyToOne(() => Campus, (campus) => campus.course, {
  //   eager: true,
  // })
  // @JoinColumn({ name: 'campusId' })
  // campus?: Campus;

  // @ManyToOne(() => Level, (level) => level.course, {
  //   eager: true,
  // })
  // @JoinColumn({ name: 'leveld' })
  // level?: Level;

  @ManyToOne(
    () => ActivityClassroom,
    (activityClassroom) => activityClassroom.course,
    {
      eager: true,
    },
  )
  @JoinColumn({ name: 'activityClassroomId' })
  activityClassroom?: ActivityClassroom;

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

  @OneToMany(() => Ratings, (ratings) => ratings.course, {
    // eager: true,
  })
  ratings?: Ratings[];
}
