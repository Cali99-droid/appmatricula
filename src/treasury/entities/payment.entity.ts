import { ApiProperty } from '@nestjs/swagger';
import { Student } from 'src/student/entities/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Concept } from './concept.entity';

@Entity()
export class Payment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '2023-01-01',
    description: 'date of payment',
  })
  @Column('date')
  date: Date;

  @ApiProperty({
    example: '100.000',
    description: 'mont',
  })
  @Column('double')
  total: number;

  @ApiProperty({
    example: 'true',
    description: 'status of payment',
  })
  @Column('boolean')
  status: boolean;

  @ApiProperty({
    example: 'dhsdfhsfdhw',
    description: 'sub of user',
  })
  @Column('varchar')
  user: string;

  @Column('varchar', {
    nullable: true,
  })
  receipt: string;

  /**Relaciones */
  @ApiProperty({
    description: 'Id of concept',
  })
  @ManyToOne(() => Concept, { nullable: true })
  @JoinColumn({ name: 'conceptId' })
  concept?: Concept;
  @ApiProperty({
    description: 'Id of Student',
  })
  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student?: Student;

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
