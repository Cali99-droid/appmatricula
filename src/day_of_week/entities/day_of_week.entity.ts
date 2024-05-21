import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Year } from 'src/years/entities/year.entity';
import { Day } from 'src/common/enum/day.enum';

@Entity()
export class DayOfWeek {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  //**Day of week must be 'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU' */
  @ApiProperty({
    // example: 'MO',
    description: 'day of week',
  })
  @Column({ type: 'enum', enum: Day })
  name: Day;

  @ApiProperty({
    example: '1',
    description: 'optional, 1: active, 0 inactive',
  })
  @Column('boolean', { default: '1' })
  status?: boolean;
  @ManyToOne(() => Year, (year) => year.holiday, {
    eager: true,
  })
  @JoinColumn({ name: 'yearId' })
  year?: Year;
}
