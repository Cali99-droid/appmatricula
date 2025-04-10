import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from 'src/student/entities/student.entity';

@Entity()
export class Transfer {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '010101',
    description: 'district school of the transfers',
  })
  @Column()
  district: string;

  @ApiProperty({
    example: 'markham',
    description: 'school destination of the transfers',
  })
  @Column()
  schoolDestination: string;

  @ApiProperty({
    example: 'Cambio de ciudad',
    description: 'reason of the transfers',
  })
  @Column()
  reason: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'transfersDate of the transfers',
  })
  @Column({ type: 'date' })
  transfersDate: Date;

  @ManyToOne(() => Student, (student) => student.transfers)
  student: Student;

  @ApiProperty({
    example: 'true',
    description: 'status of the transfers',
  })
  @Column('bool', {
    default: true,
  })
  status: boolean;

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
