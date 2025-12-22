import { ApiProperty } from '@nestjs/swagger';
import { Person } from '../../person/entities/person.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Assignment } from './assignments.entity';
import { AssignmentClassroom } from './assignments-classroom.entity';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @Column('text', {
    nullable: true,
  })
  sub: string;

  @Column('varchar', {
    unique: true,
  })
  email: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('varchar', {
    nullable: true,
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Id of Person',
  })
  @OneToOne(() => Person, (person) => person.user)
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column({ nullable: true })
  personId?: number;

  // @OneToMany(() => Permission, (permission) => permission.user, {
  //   // cascade: true,
  //   eager: true,
  // })
  // permission: Permission[];

  @OneToMany(() => Assignment, (assignment) => assignment.user, {
    eager: true,
  })
  assignments: Assignment[];

  @OneToMany(
    () => AssignmentClassroom,
    (assignmentClass) => assignmentClass.user,
  )
  assignmentsClassroom?: AssignmentClassroom[];
  // @ManyToMany(() => Role, (role) => role.users, {
  //   eager: true,
  // })
  // @JoinTable()
  // roles: Role[];

  @Column('varchar', {
    nullable: true,
  })
  crmGHLId: string;

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
  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLocaleLowerCase().trim();
  }
  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
