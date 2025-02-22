import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TypeEmail } from '../enum/type-email';
import * as moment from 'moment-timezone';
import { EmailDetail } from './emailDetail.entity';
@Entity()
export class Email {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TypeEmail,
  })
  type: TypeEmail;

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

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
  @BeforeInsert()
  updateTimestamp() {
    this.createdAt = moment().tz('America/Lima').toDate();
  }
  @ApiProperty({
    example: 'R',
    description: 'Tipo de Email, puede ser "R"(ratification), "O"(Other)',
  })

  // @ManyToOne(() => Student, (student) => student.email, {
  //   eager: true,
  // })
  // @JoinColumn({ name: 'studentId' })
  // student?: Student;

  // @Column('bool', {
  //   default: false,
  // })
  // opened: boolean;
  @OneToMany(() => EmailDetail, (emailDetail) => emailDetail.email, {
    eager: true,
  })
  emailDetails: EmailDetail[];
}
