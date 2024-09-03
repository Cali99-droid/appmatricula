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
import { TypeSure } from '../enum/type-sure.enum';

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

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  provinceCode: string;

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  address: string;

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  reference: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: TypeSure,
  })
  type_sure: string;

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  sure: string;

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  addressSure: string;

  @OneToMany(() => Student, (student) => student.family, {
    // eager: true,
  })
  student?: Student[];
}
