import { Student } from 'src/student/entities/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
export enum Issue {
  DUPLICATE_CARNET = 'DUPLICATE_CARNET',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}

export enum Status {
  OPEN = 'OPEN', // La solicitud está activa y en proceso
  CLOSED = 'CLOSED', // La solicitud está finalizada (aceptada o rechazada)
}
@Entity()
export class SchoolRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Issue })
  issue: Issue;

  @Index({ unique: true })
  @Column()
  requestCode: string; // Ej: TR-8XF7K2

  @Column({ type: 'enum', enum: Status, default: Status.OPEN })
  status: Status;

  // Relaciones
  @ManyToOne(() => Student)
  student: Student;

  @Column()
  studentId: number;

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
