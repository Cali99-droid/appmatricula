import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import { Student } from '../../student/entities/student.entity';
import { User } from '../../user/entities/user.entity';
import { Gender } from 'src/common/enum/gender.enum';
import { FamilyRole } from 'src/common/enum/family-role.enum';
import { Family } from 'src/family/entities/family.entity';
//test

@Entity()
export class Person {
  // @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '71562526',
    description: 'person DNI',
    uniqueItems: true,
  })
  @Column('varchar', {
    length: 8,
    unique: true,
    nullable: true,
  })
  docNumber: string;

  @ApiProperty({
    example: 'Jose',
    description: 'name of person',
  })
  @Column('varchar', {
    nullable: true,
  })
  name: string;

  @ApiProperty({
    example: 'Jose Luis',
    description: 'lastName of person',
  })
  @Column('varchar', {
    nullable: true,
  })
  lastname: string;

  @ApiProperty({
    example: 'Ramirez',
    description: 'mLastName of person',
  })
  @Column('varchar', {
    nullable: true,
  })
  mLastname: string;

  @ApiProperty({
    example: 'M',
    description: 'gender, must be M or F',
  })
  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'enum', enum: FamilyRole })
  familyRole: FamilyRole;
  //**TODO:  atributo de uso temporal, para la subida en bloque de estudiantes */
  @ApiProperty({
    description: 'studentCode',
  })
  @Column('varchar', {
    nullable: true,
  })
  studentCode: string;

  @ApiProperty({
    description: 'Cell phone ',
  })
  @Column('varchar', {
    nullable: true,
  })
  cellPhone: string;

  @ApiProperty({
    description: 'Birthdate',
  })
  @Column('date', {
    nullable: true,
  })
  birthDate: Date;

  @ApiProperty({
    description: 'Profession ',
  })
  @Column('varchar', {
    nullable: true,
  })
  profession: string;

  @OneToOne(() => Student, (student) => student.person)
  student?: Student;

  @OneToOne(() => User, (user) => user.person)
  user?: User;
  @OneToMany(() => Family, (family) => family.parentOneId)
  familyOne?: Family;
  @OneToMany(() => Family, (family) => family.parentTwoId)
  familyTwo?: Family;
}
