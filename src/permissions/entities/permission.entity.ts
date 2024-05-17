import { ApiProperty } from '@nestjs/swagger';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Permission {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ValidRoles })
  accessName: ValidRoles;

  @ManyToOne(() => User, (user) => user.permission)
  @JoinColumn({ name: 'userId' })
  user: User;
}
