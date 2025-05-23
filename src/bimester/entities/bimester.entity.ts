import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Phase } from 'src/phase/entities/phase.entity';
import { Ratings } from 'src/academic_structure/ratings/entities/ratings.entity';

@Entity()
export class Bimester {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Primer bimestre',
    description: 'Name of bimester',
  })
  @Column('varchar')
  name: string;

  @ApiProperty({
    example: '2023-03-01',
    description: 'start of the phase',
  })
  @Column('date')
  startDate: Date;

  @ApiProperty({
    example: '2023-06-31',
    description: 'end of the phase',
  })
  @Column('date')
  endDate: Date;

  @Column('bool', {
    default: true,
  })
  status: boolean;

  @ManyToOne(() => Phase, (phase) => phase.bimester)
  @JoinColumn({ name: 'phaseId' })
  phase?: Phase;

  @OneToMany(() => Ratings, (ratings) => ratings.bimester)
  ratings?: Ratings[];
}
