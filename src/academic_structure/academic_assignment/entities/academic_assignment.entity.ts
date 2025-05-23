import { ApiProperty } from '@nestjs/swagger';
import { Area } from 'src/academic_structure/area/entities/area.entity';
import { ActivityCourse } from 'src/academic_structure/course/entities/activityCourse.entity';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum TypeAssignment {
  COMPLETE_AREA = 'COMPLETE_AREA',
  SPECIFIC_COURSE = 'SPECIFIC_COURSE',
}
@Entity()
export class AcademicAssignment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'true',
    description: 'if the teacher is tutor',
  })
  @Column('bool', {
    default: false,
  })
  isTutor: boolean;

  @Column({ type: 'enum', enum: TypeAssignment })
  typeAssignment: TypeAssignment;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
  })
  user?: User;

  @ManyToOne(() => Area, {
    eager: true,
    nullable: true,
  })
  area?: Area;

  @ManyToOne(() => ActivityCourse, {
    eager: true,
    nullable: true,
  })
  actCourse?: ActivityCourse;

  @ManyToOne(() => ActivityClassroom, {
    eager: true,
    nullable: true,
  })
  activityClassroom?: ActivityClassroom;
}
