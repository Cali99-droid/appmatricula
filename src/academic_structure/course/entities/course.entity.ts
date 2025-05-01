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
import { CourseDetail } from './course_detail.entity';

@Entity()
export class Course {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '2023',
    description: 'Name of area',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: true,
  })
  name: string;

  @ManyToOne(() => Area, (area) => area.course, {
    eager: true,
  })
  @JoinColumn({ name: 'areaId' })
  area: Area;
  
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

  @OneToMany(() => CourseDetail, (courseDetail) => courseDetail.course, {
    // eager: true,
  })
  courseDetail?: CourseDetail[];
}
