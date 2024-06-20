import { ApiProperty } from '@nestjs/swagger';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Permission {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ValidRoles })
  accessName: ValidRoles;
  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  name: string;

  // @ManyToOne(() => User, (user) => user.permission)
  // @JoinColumn({ name: 'userId' })
  // user: User;
}
