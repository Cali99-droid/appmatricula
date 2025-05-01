import { ApiProperty } from '@nestjs/swagger';
import { Area } from 'src/academic_structure/area/entities/area.entity';
import { CourseDetail } from 'src/academic_structure/course/entities/course_detail.entity';
import { Ratings } from 'src/academic_structure/ratings/entities/ratings.entity';
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

@Entity()
export class Competency {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '2023',
    description: 'Name of competency',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: false,
  })
  name: string;

  @ManyToOne(() => Area, (area) => area.competency, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'areaId' })
  area?: Area;

  @ApiProperty({
    example: 1,
    description: 'Order of competency',
    uniqueItems: true,
  })
  @Column('integer', {
    unique: true,
  })
  order: number;

  @ApiProperty({
    example: 'true',
    description: 'status of the competency',
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

  @OneToMany(() => Ratings, (ratings) => ratings.competency)
  ratings?: Ratings[];

  @OneToMany(() => CourseDetail, (course) => course.competency)
  courseDetail?: CourseDetail[];
}
