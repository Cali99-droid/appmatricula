import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Payment } from './payment.entity';
import { TypeOfVoucher } from '../enum/TypeOfVoucher.enum';
import { ProcessingStatusInterface } from '../interfaces/ProcessingStatus.interface';

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
  @Column('varchar', {
    nullable: true,
  })
  numero: number;

  @ApiProperty({
    example: 'true',
    description: 'if acepteds',
  })
  @Column('boolean')
  accepted: boolean;

  @Column({
    type: 'enum',
    enum: TypeOfVoucher,
    default: TypeOfVoucher.BOLETA,
  })
  typeOfVoucher: TypeOfVoucher;

  @Column({
    type: 'enum',
    enum: ProcessingStatusInterface,
    default: ProcessingStatusInterface.default,
  })
  processingStatus: ProcessingStatusInterface;

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

  /**Relaciones */
  @ApiProperty({
    description: 'Id of Student',
  })
  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'paymentId' })
  payment?: Payment;
}
