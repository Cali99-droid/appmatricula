import { Classroom } from 'src/classroom/entities/classroom.entity';
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Phase } from './phase.entity';

@Entity()
export class PhaseToClassroom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  classroomId: number;

  @Column()
  phaseId: number;

  // @Column()
  // public order: number

  @ManyToOne(() => Classroom, (classroom) => classroom.phaseToClassroom, {
    eager: true,
  })
  classroom?: Classroom;

  @ManyToOne(() => Phase, (phase) => phase.phaseToClassroom, {
    cascade: true,
  })
  phase?: Phase;
}
