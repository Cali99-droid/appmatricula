import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Year } from 'src/years/entities/year.entity';

@Entity()
export class DayOfWeek {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Lunes',
    description: 'Day of day of week',
  })
  @Column('varchar', { unique: false })
  name: string;

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
