import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Family {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  nameFamily: string;

  @ApiProperty()
  @Column('varchar', {
    length: 8,
  })
  dniAssignee: string;

  @ApiProperty()
  @Column('varchar')
  sonStudentCode: string;
}
