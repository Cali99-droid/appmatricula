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
export class Holiday {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Dia de la madre',
    description: 'Description of holiday',
  })
  @Column('varchar')
  description: string;

  @ApiProperty({
    example: '2023-01-01',
    description: 'date of the holiday',
    uniqueItems: true,
  })
  @Column('date', {
    unique: true,
  })
  date: Date;

  @ManyToOne(() => Year, (year) => year.holiday, {
    eager: true,
  })
  @JoinColumn({ name: 'yearId' })
  year?: Year;
}
