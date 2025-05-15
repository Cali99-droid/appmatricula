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
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';

@Entity()
export class ActivityCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false }) // ← El flag ahora vive aquí
  forAllClassrooms: boolean;

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

  @ManyToMany(() => ActivityClassroom)
  @JoinTable({
    name: 'course_activityClassroom', // nombre de la tabla intermedia
    joinColumn: {
      name: 'activityCourseId', // nombre de la columna que referencia a esta entidad
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'activityClassroomId', // nombre de la columna que referencia a la entidad relacionada
      referencedColumnName: 'id',
    },
  })
  activityClassrooms: ActivityClassroom[]; // ← Aulas específicas (si paraTodasAulas es false)
}
