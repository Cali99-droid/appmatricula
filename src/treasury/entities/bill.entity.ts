import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class Bill {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '2023-01-01',
    description: 'date of bill',
  })
  @Column('date')
  date: Date;

  @Column('varchar', {
    nullable: true,
  })
  url: string;
  @Column('varchar', {
    nullable: true,
  })
  serie: string;

  /**Relaciones */
  @ApiProperty({
    description: 'Id of Student',
  })
  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'paymentId' })
  payment?: Payment;
}
