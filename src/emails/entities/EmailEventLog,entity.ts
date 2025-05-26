import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// email-event-log.entity.ts
@Entity()
export class EmailEventLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  eventType: 'Bounce' | 'Complaint' | 'Delivery';

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt: Date;
}
