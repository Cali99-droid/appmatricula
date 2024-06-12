import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { CampusDetail } from '../../campus_detail/entities/campus_detail.entity';
import { Year } from '../../years/entities/year.entity';

import { CampusToLevel } from './campusToLevel.entity';
import { ApiProperty } from '@nestjs/swagger';
import { SchoolShift } from '../../school_shifts/entities/school_shift.entity';

@Entity()
export class Campus {
  @ApiProperty({
    example: '1',
    description: 'end of the phase',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CampusDetail, (campusDetail) => campusDetail.campus, {
    eager: true,
  })
  @JoinColumn({ name: 'campusDetailId' })
  campusDetail?: CampusDetail;

  @ManyToOne(() => Year, (grade) => grade.campus, {
    eager: true,
  })
  @JoinColumn({ name: 'yearId' })
  year?: Year;

  @ApiProperty({
    description: 'array of campusToLevel by Level ',
  })
  @OneToMany(() => CampusToLevel, (campusToLevel) => campusToLevel.campus, {
    eager: true,
  })
  campusToLevel?: SchoolShift[];
  @OneToMany(() => SchoolShift, (schoolShift) => schoolShift.campus, {
    // eager: true,
  })
  schoolShift?: SchoolShift[];
}
