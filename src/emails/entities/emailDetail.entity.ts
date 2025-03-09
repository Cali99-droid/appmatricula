import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import * as moment from 'moment-timezone';
import { Email } from './email.entity';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';

@Entity()
export class EmailDetail {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (email) => email.emailsDetails, {
    eager: true,
  })
  @JoinColumn({ name: 'studentId' })
  student?: Student;

  @ManyToOne(() => Person, (email) => email.emailsDetails, {
    eager: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Person;

  @ManyToOne(() => Email, (email) => email.emailDetails, {
    // eager: true,
  })
  @JoinColumn({ name: 'emailId' })
  email?: Email;

  @Column('varchar', {
    nullable: true,
  })
  status: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
  @BeforeInsert()
  updateTimestamp() {
    this.createdAt = moment().tz('America/Lima').toDate();
  }
}
