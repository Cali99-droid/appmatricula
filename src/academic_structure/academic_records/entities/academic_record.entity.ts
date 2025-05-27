import { ApiProperty } from '@nestjs/swagger';
import { AcademicAssignment } from 'src/academic_structure/academic_assignment/entities/academic_assignment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ValueGrade } from '../enum/value-grade.enum';
import { Student } from 'src/student/entities/student.entity';
import { Competency } from 'src/academic_structure/competency/entities/competency.entity';
import { User } from 'src/user/entities/user.entity';
@Entity()
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

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  comment: string;

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
