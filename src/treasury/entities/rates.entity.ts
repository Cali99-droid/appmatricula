import { ApiProperty } from '@nestjs/swagger';
import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { Level } from 'src/level/entities/level.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Concept } from './concept.entity';
import { Year } from 'src/years/entities/year.entity';

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

  @ManyToOne(() => Year, {
    nullable: true,
  })
  year?: Year;

  @Column({
    nullable: true,
  })
  yearId?: number;

  /**TIMESTAMPS */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    select: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    select: false,
  })
  updatedAt: Date;
}
