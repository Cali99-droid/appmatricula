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

export enum RequestTrackingArea {
  PSYCHOLOGY = 'PSYCHOLOGY',
  ADMINISTRATOR_CAMPUS = 'ADMINISTRATOR_CAMPUS',
  CORDINATOR = 'CORDINATOR',
  SECRETARY = 'SECRETARY',
}
export enum ProcessStateTracking {
  PENDING = 'PENDING', // Aún no se ha realizado ninguna acción
  REGISTERED = 'REGISTERED', // Aún no se ha realizado ninguna acción
  MEETING_SCHEDULED = 'MEETING_SCHEDULED', // Se agendó la reunión
  REPORT_UPLOADED = 'REPORT_UPLOADED', // Se subió el informe/decisión
  FINALIZED = 'FINALIZED', //FINALIZó
}
@Entity()
export class TransferRequestTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime', nullable: true })
  arrivalDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: RequestTrackingArea })
  area: RequestTrackingArea;

  @Column({
    type: 'enum',
    enum: ProcessStateTracking,
    default: ProcessStateTracking.REGISTERED,
  })
  status: ProcessStateTracking;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

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
