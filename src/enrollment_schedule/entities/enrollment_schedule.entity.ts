import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Year } from '../../years/entities/year.entity';
import { ApiProperty } from '@nestjs/swagger';
import { TypeEnrollmentSchedule } from '../enum/type-enrollment_schedule';

@Entity()
export class EnrollmentSchedule {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Matricula para estudiantes',
    description: 'Name of enrollment schedule',
    uniqueItems: false,
  })
  @Column('varchar', {
    unique: false,
  })
  name: string;

  @ApiProperty({
    example: '2023-11-01',
    description: 'start of the enrollment Schedule',
  })
  @Column('date')
  startDate: Date;

  @ApiProperty({
    example: '2024-01-31',
    description: 'end of the enrollment Schedule',
  })
  @Column('date')
  endDate: Date;

  @ApiProperty({
    example: 'MATRICULA',
    description: 'type of phase, must be MATRICULA or ADMISION',
  })
  @Column({
    type: 'enum',
    enum: TypeEnrollmentSchedule,
  })
  type: TypeEnrollmentSchedule;

  @ManyToOne(() => Year, (year) => year.phase, {
    eager: true,
  })
  @JoinColumn({ name: 'yearId' })
  year?: Year;
}
