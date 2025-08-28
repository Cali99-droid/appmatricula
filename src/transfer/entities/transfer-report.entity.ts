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
export enum AuthorRole {
  PSYCHOLOGIST = 'PSYCHOLOGIST',
  ADMINISTRATOR = 'ADMINISTRATOR',
}
@Entity()
export class TransferReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean' })
  conclusion: boolean;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'enum', enum: AuthorRole })
  authorRole: AuthorRole;

  @ManyToOne(() => TransferRequest)
  transferRequest: TransferRequest;

  @Column()
  transferRequestId: number;

  @ManyToOne(() => User)
  user: User;

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
