import { ApiProperty } from '@nestjs/swagger';
import { Competency } from 'src/academic_structure/competency/entities/competency.entity';
import { Bimester } from 'src/bimester/entities/bimester.entity';
import { Student } from 'src/student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Ratings {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.ratings, {
    eager: true,
  })
  @JoinColumn({ name: 'studentId' })
  student?: Student;

  @ManyToOne(() => Bimester, (bimester) => bimester.ratings, {
    eager: true,
  })
  @JoinColumn({ name: 'bimesterId' })
  bimester?: Bimester;

  @ManyToOne(() => Competency, (comptency) => comptency.ratings, {
    eager: true,
  })
  @JoinColumn({ name: 'competencyId' })
  competency?: Competency;

  @ManyToOne(() => User, (teacher) => teacher.ratings, {
    eager: true,
  })
  @JoinColumn({ name: 'teacherId' })
  teacher?: User;

  @ApiProperty({
    example: 'A+',
    description: 'qualification of ratings',
  })
  @Column('varchar', {
    unique: false,
  })
  qualification: string;

  @ApiProperty({
    example: 'true',
    description: 'status of the student',
  })
  @Column('bool', {
    default: true,
  })
  status: boolean;

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
