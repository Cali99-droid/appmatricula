import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
@Entity()
export class DebtorsHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    nullable: true,
    unique: true,
  })
  student: string;
  @Column('varchar', {
    nullable: true,
    unique: true,
  })
  docNumber: string;
  @Column('varchar', {
    nullable: true,
  })
  family: string;
  @Column('varchar', {
    nullable: true,
  })
  phone: string;
  @Column('varchar', {
    nullable: true,
  })
  address: string;
}
