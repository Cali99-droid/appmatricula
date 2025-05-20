import { Competency } from 'src/academic_structure/competency/entities/competency.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';

import { Grade } from 'src/grade/entities/grade.entity';

@Entity()
export class ActivityCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false }) // ← El flag ahora vive aquí
  forAllGrades: boolean;

  @Column({ default: true })
  active: boolean;
  //   @ManyToOne(() => PeriodoAcademico)
  //   periodo: PeriodoAcademico;

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
}
