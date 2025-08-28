import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransferRequest } from './transfer-request.entity';
import { User } from 'src/user/entities/user.entity';

export enum TransferMeetingType {
  PSYCHOLOGIST = 'PSYCHOLOGIST',
  ADMINISTRATOR = 'ADMINISTRATOR',
}
@Entity()
export class TransferMeeting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  meetingDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: TransferMeetingType })
  type: TransferMeetingType;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => TransferRequest)
  transferRequest: TransferRequest;

  @Column()
  transferRequestId: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
