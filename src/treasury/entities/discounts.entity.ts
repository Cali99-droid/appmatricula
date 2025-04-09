import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Debt } from './debt.entity';

@Entity()
export class Discounts {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    nullable: true,
  })
  reason: string;

  @Column('int', {
    nullable: false,
  })
  percentage: number;
  /**Relaciones */
  @ApiProperty({
    description: 'Id of debt',
  })
  @OneToOne(() => Debt, { nullable: true })
  @JoinColumn({ name: 'debtId' })
  debt?: Debt;
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
