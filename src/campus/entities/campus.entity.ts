import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { Year } from 'src/years/entities/year.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CampusToLevel } from './campusToLevel.entity';

@Entity()
export class Campus {
  @ApiProperty({
    example: '1',
    description: 'end of the phase',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CampusDetail, (campusDetail) => campusDetail.campus)
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
  campusToLevel?: CampusToLevel[];
}
