import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Concept {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    nullable: true,
  })
  description: string;
  @Column('varchar', {
    unique: true,
    nullable: true,
  })
  code: string;

  @ApiProperty({
    example: '100.000',
    description: 'mont',
  })
  @Column('double')
  total: number;

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
