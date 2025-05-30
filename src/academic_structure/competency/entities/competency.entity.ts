import { ApiProperty } from '@nestjs/swagger';
import { Area } from 'src/academic_structure/area/entities/area.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @ApiProperty({
    example: 1,
    description: 'Order of competency',
    uniqueItems: true,
  })
  @Column('integer', {
    // unique: true,
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

  @ManyToOne(() => Area, (area) => area.competency, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'areaId' })
  area?: Area;

  // @ManyToOne(() => Course, (course) => course.competency, {
  //   nullable: true,
  //   onDelete: 'SET NULL',
  // })
  // course?: Course;
  //   @OneToMany(() => CursoPeriodo, cursoPeriodo => cursoPeriodo.curso)
  // periodos: CursoPeriodo[];

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
