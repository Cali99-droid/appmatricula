import { ApiProperty } from '@nestjs/swagger';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Family {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  nameFamily: string;

  @ManyToOne(() => Person, (person) => person.familyOne, {
    // eager: true,
  })
  @JoinColumn({ name: 'parentOneId' })
  parentOneId?: Person;

  @ManyToOne(() => Person, (person) => person.familyTwo, {
    // eager: true,
  })
  @JoinColumn({ name: 'parentTwoId' })
  parentTwoId?: Person;

  @OneToMany(() => Student, (student) => student.family, {
    // eager: true,
  })
  student?: Student[];
}
