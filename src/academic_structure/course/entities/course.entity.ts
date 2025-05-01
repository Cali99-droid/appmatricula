import { ApiProperty } from '@nestjs/swagger';
import { Area } from 'src/academic_structure/area/entities/area.entity';
import { Competency } from 'src/academic_structure/competency/entities/competency.entity';
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
  area?: Area;

  @ManyToOne(() => Competency, (competency) => competency.course, {
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

  @OneToMany(() => Competency, (competency) => competency.course, {
    // eager: true,
  })
  competency?: Competency[];
}
