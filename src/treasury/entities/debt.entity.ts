import { ApiProperty } from '@nestjs/swagger';
import { Student } from 'src/student/entities/student.entity';
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
import { Concept } from './concept.entity';
import { Discounts } from './discounts.entity';

@Entity()
export class Debt {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '2023-01-01',
    description: 'date of debt',
  })
  @Column('date')
  dateEnd: Date;

  @ApiProperty({
    example: '100.000',
    description: 'mont',
  })
  @Column('double')
  total: number;

  @ApiProperty({
    example: 'true',
    description: 'status of debt',
  })
  @Column('boolean')
  status: boolean;

  @Column('varchar', {
    nullable: true,
  })
  description: string;

  @Column('varchar', {
    nullable: true,
    unique: true,
  })
  code: string;

  @Column('varchar', {
    nullable: true,
  })
  obs: string;

  /**Relaciones */
  @ApiProperty({
    description: 'Id of Student',
  })
  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student?: Student;

  @ApiProperty({
    description: 'Id of concept',
  })
  @ManyToOne(() => Concept, { nullable: true })
  @JoinColumn({ name: 'conceptId' })
  concept?: Concept;

  @OneToOne(() => Discounts, (dis) => dis.debt, {
    // cascade: true,
    // eager: true,
  })
  discount?: Discounts;

  /**TIMESTAMPS */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    select: true,
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
