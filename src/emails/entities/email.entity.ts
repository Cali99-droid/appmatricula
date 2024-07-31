import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DataSource,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Repository,
  getRepository,
} from 'typeorm';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Person } from '../../person/entities/person.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { Family } from 'src/family/entities/family.entity';
import { Year } from 'src/years/entities/year.entity';
import { TypeEmail } from '../enum/type-email';
@Entity()
export class Email {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    nullable: true,
  })
  receivers: string;
  @Column('varchar', {
    nullable: true,
  })
  subject: string;
  @Column('longtext', {
    nullable: true,
  })
  body: string;
  @Column('varchar', {
    nullable: true,
  })
  quantity: string;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
  @ApiProperty({
    example: 'R',
    description: 'Tipo de Email, puede ser "R"(ratification), "O"(Other)',
  })
  @Column({
    type: 'enum',
    enum: TypeEmail,
  })
  type: TypeEmail;
  // @ApiProperty({
  //   example: 'true',
  //   description: 'status of the student',
  // })
  // @Column('bool', {
  //   default: true,
  // })
  // status: boolean;
}
