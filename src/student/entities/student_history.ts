import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { ActionType } from '../enum/actionType.enum';
import { User } from 'src/user/entities/user.entity';
import { Student } from './student.entity';
@Entity()
export class StudentHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ActionType,
    default: ActionType.OTRO,
  })
  actionType: ActionType;

  @Column('varchar', {
    nullable: true,
    unique: true,
  })
  obs: string;

  @ApiProperty({
    description: 'Id of user',
  })
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ApiProperty({
    description: 'Id of user',
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

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
