import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Person } from '../../person/entities/person.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { Family } from 'src/family/entities/family.entity';
import { Email } from 'src/emails/entities/email.entity';
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

  @ManyToOne(() => Person, (person) => person.respEnrollments, {
    // eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'respEnrollment' })
  respEnrollment?: Person;

  @ManyToOne(() => Person, (person) => person.respEconomics, {
    // eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'respEconomic' })
  respEconomic?: Person;

  @ManyToOne(() => Person, (person) => person.respAcademics, {
    // eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'respAcademic' })
  respAcademic?: Person;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollment?: Enrollment[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendance?: Attendance[];
  @OneToMany(() => Email, (email) => email.student, {
    // eager: true,
  })
  email: Email[];
}
