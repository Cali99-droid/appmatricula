import { ApiProperty } from '@nestjs/swagger';
import { Person } from '../../person/entities/person.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/role/entities/role.entity';
import { Assignment } from './assignments.entity';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

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
  @OneToOne(() => Person, (person) => person.user, {
    eager: true,
  })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @OneToMany(() => Permission, (permission) => permission.user, {
    // cascade: true,
    eager: true,
  })
  permission: Permission[];

  @OneToMany(() => Assignment, (assignment) => assignment.user)
  assignments: Assignment[];

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLocaleLowerCase().trim();
  }
  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
