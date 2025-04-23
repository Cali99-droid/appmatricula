import { ApiProperty } from '@nestjs/swagger';
import { Phase } from '../../phase/entities/phase.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Grade } from 'src/grade/entities/grade.entity';
import { Area } from 'src/area/entities/area.entity';

@Entity()
export class AreaAssignments {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Area, (area) => area.areaAssignments, {
    eager: true,
  })
  @JoinColumn({ name: 'areaId' })
  area?: Area;

  @ApiProperty({
    example: '1',
    description: 'Name of area',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: true,
  })
  orden: number;

  @ManyToOne(() => Phase, (year) => year.areaAssignments, {
    eager: true,
  })
  @JoinColumn({ name: 'phaseId' })
  phase?: Phase;

  @ManyToOne(() => Grade, (grade) => grade.areaAssignments, {
    eager: true,
  })
  @JoinColumn({ name: 'gradeId' })
  grade?: Grade;

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
