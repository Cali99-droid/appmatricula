import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Gener } from '../enum/gener.enum';
import { Student } from './student.entity';
@Entity()
export class Person {
  @ApiProperty()
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
  })
  doc_number: string;

  @ApiProperty({
    example: 'Jose',
    description: 'name of person',
  })
  @Column('varchar', {
    unique: true,
  })
  name: string;

  @ApiProperty({
    example: 'Jose Luis',
    description: 'lastName of person',
  })
  @Column('varchar')
  lastName: string;

  @ApiProperty({
    example: 'Ramirez',
    description: 'mLastName of person',
  })
  @Column('varchar')
  mLastName: string;

  @ApiProperty({
    example: 'M',
    description: 'gender, must be M or F',
  })
  @Column({ enum: Gener })
  gender: string;

  @OneToOne(() => Student, (student) => student.person)
  student?: Student;
}
