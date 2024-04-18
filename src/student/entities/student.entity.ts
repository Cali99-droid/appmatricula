import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Person } from '../../person/entities/person.entity';
import { ApiProperty } from '@nestjs/swagger';
@Entity()
export class Student {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    nullable: true,
  })
  studentCode: string;
  @Column('varchar', {
    nullable: true,
  })
  photo: string;
  @ApiProperty({
    description: 'Id of Person',
  })
  @OneToOne(() => Person, (person) => person.student, {
    eager: true,
  })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollment?: Enrollment[];
}
