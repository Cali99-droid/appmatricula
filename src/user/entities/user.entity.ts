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
import { Permission } from 'src/permissions/entities/permission.entity';

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
