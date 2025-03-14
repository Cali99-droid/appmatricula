import { ApiProperty } from '@nestjs/swagger';
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
import { CreditNoteType } from '../enum/CreditNoteType.enum';
import { Bill } from './bill.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class CreditNote {
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
    enum: CreditNoteType,
  })
  creditNoteType: CreditNoteType;

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
    description: 'voucher id',
  })
  @OneToOne(() => Bill, { nullable: true })
  @JoinColumn({ name: 'billId' })
  bill: Bill;

  @ApiProperty({
    description: 'voucher id',
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
