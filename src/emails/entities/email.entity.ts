import {
  BeforeInsert,
  Column,
  DataSource,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Repository,
  getRepository,
} from 'typeorm';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Person } from '../../person/entities/person.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { Family } from 'src/family/entities/family.entity';
import { Year } from 'src/years/entities/year.entity';
@Entity()
export class Email {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    nullable: true,
    unique: true,
  })
  receivers: string;
  @Column('varchar', {
    nullable: true,
    unique: true,
  })
  subject: string;
  @Column('varchar', {
    nullable: true,
  })
  body: string;
  @ApiProperty({
    example: 'true',
    description: 'status of the student',
  })
  @Column('bool', {
    default: true,
  })
  status: boolean;

//   @ManyToOne(() => Year, (year) => year.email, {
//     eager: true,
//   })
//   @JoinColumn({ name: 'yearId' })
//   year?: Year;
}
