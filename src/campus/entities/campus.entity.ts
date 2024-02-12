import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { Level } from 'src/level/entities/level.entity';
import { Year } from 'src/years/entities/year.entity';
@Entity()
export class Campus {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CampusDetail, (campusDetail) => campusDetail.campus)
  @JoinColumn({ name: 'campusDetailId' })
  campusDetail?: CampusDetail;

  @ManyToOne(() => Level, (level) => level.campus)
  @JoinColumn({ name: 'levelId' })
  level?: Level;

  @ManyToOne(() => Year, (grade) => grade.campus)
  @JoinColumn({ name: 'yearId' })
  year?: Year;
}
