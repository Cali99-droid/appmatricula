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
import { CampusXLevel } from 'src/campus_x_level/entities/campus_x_level.entity';
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
    description: 'array of campusXlevel by Level ',
  })
  @OneToMany(() => CampusXLevel, (campusXlevel) => campusXlevel.campus, {
    // cascade: true,
    // eager: true,
  })
  campusXlevel?: CampusXLevel[];
}
