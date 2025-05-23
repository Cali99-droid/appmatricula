import { Competency } from 'src/academic_structure/competency/entities/competency.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';

import { Grade } from 'src/grade/entities/grade.entity';
import { Campus } from 'src/campus/entities/campus.entity';
import { Phase } from 'src/phase/entities/phase.entity';

@Entity()
export class ActivityCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false }) // ← El flag ahora vive aquí
  forAllGrades: boolean;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Phase)
  phase: Phase;

  @ManyToOne(() => Campus)
  campus: Campus;

  @ManyToMany(() => Competency)
  @JoinTable({
    name: 'course_competencies', // nombre de la tabla intermedia
    joinColumn: {
      name: 'activityCourseId', // nombre de la columna que referencia a esta entidad
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'competencyId', // nombre de la columna que referencia a la entidad relacionada
      referencedColumnName: 'id',
    },
  })
  competencies: Competency[];

  @ManyToOne(() => Course, (course) => course.activityCourse)
  course: Course;

  @ManyToMany(() => Grade)
  @JoinTable({
    name: 'course_grade', // nombre de la tabla intermedia
    joinColumn: {
      name: 'activityCourseId', // nombre de la columna que referencia a esta entidad
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'gradeId', // nombre de la columna que referencia a la entidad relacionada
      referencedColumnName: 'id',
    },
  })
  grades: Grade[]; // ← Aulas específicas (si paraTodasAulas es false)

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
