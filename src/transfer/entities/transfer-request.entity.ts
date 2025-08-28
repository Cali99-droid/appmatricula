import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Campus } from 'src/campus/entities/campus.entity';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Enums para claridad y consistencia
export enum TransferType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}
// Enums para los nuevos estados
export enum MainStatus {
  OPEN = 'OPEN', // La solicitud está activa y en proceso
  PENDING_AGREEMENT = 'PENDING_AGREEMENT', // Aprobado, esperando subida del acta
  CLOSED = 'CLOSED', // La solicitud está finalizada (aceptada o rechazada)
}

export enum ProcessState {
  PENDING = 'PENDING', // Aún no se ha realizado ninguna acción
  MEETING_SCHEDULED = 'MEETING_SCHEDULED', // Se agendó la reunión
  REPORT_UPLOADED = 'REPORT_UPLOADED', // Se subió el informe/decisión
}

export enum FinalDecision {
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
}

@Entity()
export class TransferRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  requestCode: string; // Ej: TR-8XF7K2

  @Column({ type: 'enum', enum: TransferType })
  type: TransferType;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'enum', enum: MainStatus, default: MainStatus.OPEN })
  mainStatus: MainStatus;

  @Column({ type: 'enum', enum: ProcessState, default: ProcessState.PENDING })
  psychologistState: ProcessState;

  @Column({ type: 'enum', enum: ProcessState, default: ProcessState.PENDING })
  administratorState: ProcessState;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  requestDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  agreementActUrl: string; // URL o path al archivo del acta

  // Relaciones
  @ManyToOne(() => Student)
  student: Student;

  @Column()
  studentId: number;

  // Relaciones
  @ManyToOne(() => Person)
  person: Person;

  @Column()
  personId: number;

  @ManyToOne(() => ActivityClassroom)
  @JoinColumn({ name: 'originClassroomId' })
  originClassroom: ActivityClassroom;

  @Column() // ID del aula de origen
  originClassroomId: number;

  @ManyToOne(() => ActivityClassroom)
  @JoinColumn({ name: 'destinationClassroomId' })
  destinationClassroom: ActivityClassroom;

  @Column({ nullable: true }) // ID del aula de origen
  destinationClassroomId: number;

  @ManyToOne(() => Campus)
  @JoinColumn({ name: 'destinationCampusId' })
  campus: Campus;

  @Column({ nullable: true }) // Puede ser nulo si el traslado es INTERNO
  destinationCampusId: number;

  @Column({ nullable: true }) // Solo para traslados EXTERNOS
  destinationSchoolName: string;

  // Campos para el resultado final
  @Column({ type: 'enum', enum: FinalDecision, nullable: true })
  finalDecision: FinalDecision;

  @Column({ type: 'text', nullable: true })
  decisionReason: string;

  // Relaciones
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
