import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Gender } from '../enum/gender.enum';
import { Student } from '../../student/entities/student.entity';
import { User } from '../../user/entities/user.entity';
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
  @Column('varchar')
  name: string;

  @ApiProperty({
    example: 'Jose Luis',
    description: 'lastName of person',
  })
  @Column('varchar')
  lastname: string;

  @ApiProperty({
    example: 'Ramirez',
    description: 'mLastName of person',
  })
  @Column('varchar')
  mLastname: string;

  @ApiProperty({
    example: 'M',
    description: 'gender, must be M or F',
  })
  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  //**TODO:  atributo de uso temporal, para la subida en bloque de estudiantes */
  @ApiProperty({
    description: 'studentCode',
  })
  @Column('varchar', {
    nullable: true,
  })
  studentCode: string;

  @OneToOne(() => Student, (student) => student.person)
  student?: Student;

  @OneToOne(() => User, (user) => user.person)
  user?: User;
}
