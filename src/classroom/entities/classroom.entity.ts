import { ApiProperty } from '@nestjs/swagger';

import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Classroom {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  capacity: number;

  @Column('varchar', { nullable: true, unique: true })
  code?: string;

  @Column('varchar')
  section: string;

  @Column('varchar', {
    default: 'P',
  })
  modality: string;

  @Column('boolean', { default: '1' })
  status?: boolean;

  @ManyToOne(() => CampusDetail, (campusDetail) => campusDetail.classroom, {
    eager: true,
  })
  @JoinColumn({ name: 'campusDetailId' })
  campusDetail?: CampusDetail;

  @ManyToOne(() => Grade, (grade) => grade.classroom, {
    eager: true,
  })
  @JoinColumn({ name: 'gradeId' })
  grade?: Grade;
}
