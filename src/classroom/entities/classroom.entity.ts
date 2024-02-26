import { ApiProperty } from '@nestjs/swagger';

import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';

@Entity()
export class Classroom {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column('int')
  capacity: number;

  @ApiProperty()
  @Column('varchar', { nullable: true, unique: true })
  code?: string;
  @ApiProperty({
    example: 'P (presencial)',
    description:
      'optional, type of classroom, must be P (presencial) or V (virtual)',
  })
  @Column('varchar', {
    default: 'P',
  })
  modality: string;

  @ApiProperty({
    example: '1',
    description: 'optional, 1: active, 0 inactive',
  })
  @Column('boolean', { default: '1' })
  status?: boolean;

  @ManyToOne(() => CampusDetail, (campusDetail) => campusDetail.classroom, {
    eager: true,
  })
  @JoinColumn({ name: 'campusDetailId' })
  campusDetail: CampusDetail;

  @OneToMany(
    () => ActivityClassroom,
    (activityClassroom) => activityClassroom.classroom,
  )
  activityClassroom: ActivityClassroom[];
}
