import { ApiProperty } from '@nestjs/swagger';
import { AcademicAssignment } from 'src/academic_structure/academic_assignment/entities/academic_assignment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ValueGrade } from '../enum/value-grade.enum';
import { Student } from 'src/student/entities/student.entity';
import { Competency } from 'src/academic_structure/competency/entities/competency.entity';
import { User } from 'src/user/entities/user.entity';
import { Bimester } from 'src/bimester/entities/bimester.entity';
@Entity()
@Unique(['student', 'competency', 'academicAssignment', 'bimester'])
export class AcademicRecord {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: ValueGrade,
    nullable: true,
  })
  value: ValueGrade;

  @ManyToOne(() => AcademicAssignment)
  academicAssignment: AcademicAssignment;

  @ManyToOne(() => Student)
  student: Student;

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
  })
  user?: User;

  @ManyToOne(() => Competency)
  competency: Competency;

  @ManyToOne(() => Bimester)
  bimester: Bimester;

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
