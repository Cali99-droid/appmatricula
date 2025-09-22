import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Person } from '../../person/entities/person.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { Family } from 'src/family/entities/family.entity';
import { EmailDetail } from 'src/emails/entities/emailDetail.entity';
import { Debt } from 'src/treasury/entities/debt.entity';

@Entity()
export class Student {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    nullable: true,
    unique: true,
  })
  studentCode: string;
  @Column('varchar', {
    nullable: true,
    unique: true,
  })
  code: string;
  @Column('varchar', {
    nullable: true,
  })
  photo: string;
  @ApiProperty({
    example: 'true',
    description: 'status of the student',
  })
  @Column('bool', {
    default: true,
    select: false,
  })
  status: boolean;
  @ApiProperty({
    description: 'Id of Person',
  })
  @Column('bool', {
    default: true,
  })
  hasDebt: boolean;

  @Column('varchar', {
    nullable: true,
  })
  siagie: string;

  @Column('varchar', {
    nullable: true,
  })
  school: string;

  @Column('varchar', {
    nullable: true,
  })
  modularCode: string;

  @OneToOne(() => Person, (person) => person.student, {
    eager: true,
  })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @ManyToOne(() => Family, (family) => family.student, {
    // eager: true,
  })
  @JoinColumn({ name: 'familyId' })
  family?: Family;

  @Column({ nullable: true })
  familyId: number;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollment?: Enrollment[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendance?: Attendance[];

  @OneToMany(() => EmailDetail, (emailDetail) => emailDetail.student)
  emailsDetails?: EmailDetail[];

  @OneToMany(() => Debt, (debt) => debt.student)
  debt?: Debt[];

  // @OneToMany(() => Email, (email) => email.student, {
  //   // eager: true,
  // })
  // email: Email[];
  /**TIMESTAMPS */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    select: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    select: false,
  })
  updatedAt: Date;
}
