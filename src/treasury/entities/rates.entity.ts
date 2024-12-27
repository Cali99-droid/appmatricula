import { ApiProperty } from '@nestjs/swagger';
import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { Level } from 'src/level/entities/level.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Concept } from './concept.entity';

@Entity()
export class Rates {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '100.000',
    description: 'mont',
  })
  @Column('double')
  total: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @ManyToOne(() => CampusDetail)
  @JoinColumn({ name: 'campusDetailId' })
  campusDetail: CampusDetail;

  @ManyToOne(() => Level)
  @JoinColumn({ name: 'levelId' })
  level?: Level;

  @ManyToOne(() => Concept)
  @JoinColumn({ name: 'conceptId' })
  concept?: Concept;
}