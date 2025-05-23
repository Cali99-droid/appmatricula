import { ApiProperty } from '@nestjs/swagger';
import { Competency } from 'src/academic_structure/competency/entities/competency.entity';
import { Course } from 'src/academic_structure/course/entities/course.entity';
import { Level } from 'src/level/entities/level.entity';
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
export class Area {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '2023',
    description: 'Name of area',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: false,
  })
  name: string;

  @ApiProperty({
    example: 1,
    description: 'Order of area',
    uniqueItems: true,
  })
  @Column('integer', {
    // unique: true,
  })
  order: number;

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

  @ManyToOne(() => Level, (level) => level.area, {
    eager: true,
  })
  @JoinColumn({ name: 'levelId' })
  level?: Level;

  @OneToMany(() => Competency, (competency) => competency.area, {
    // eager: true,
  })
  competency?: Competency[];

  @OneToMany(() => Course, (course) => course.area, {
    // eager: true,
  })
  course?: Course[];
}
