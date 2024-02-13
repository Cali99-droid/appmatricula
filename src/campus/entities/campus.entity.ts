import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { Level } from 'src/level/entities/level.entity';
import { Year } from 'src/years/entities/year.entity';
import { ApiProperty } from '@nestjs/swagger';
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

  @ManyToOne(() => Level, (level) => level.campus, {
    eager: true,
  })
  @JoinColumn({ name: 'levelId' })
  level?: Level;

  @ManyToOne(() => Year, (grade) => grade.campus, {
    eager: true,
  })
  @JoinColumn({ name: 'yearId' })
  year?: Year;
}
