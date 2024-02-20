import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TypePhase } from '../enum/type-phase.enum';
import { Year } from 'src/years/entities/year.entity';
import { ApiProperty } from '@nestjs/swagger';

import { PhaseToClassroom } from './phaseToClassroom.entity';

@Entity()
export class Phase {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

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

  @ApiProperty({
    example: 'REGULAR',
    description: 'type of phase, must be REGULAR or RECUPERACION',
  })
  @Column({
    type: 'enum',
    enum: TypePhase,
  })
  type: TypePhase;

  @ManyToOne(() => Year, (year) => year.phase, {
    eager: true,
  })
  @JoinColumn({ name: 'yearId' })
  year?: Year;

  // @ApiProperty({
  //   example: [1, 2, 3],
  //   nullable: true,

  //   description: "is array of id's from classrooms, is optional",
  // })
  @OneToMany(
    () => PhaseToClassroom,
    (phaseToClassrom) => phaseToClassrom.phase,
    {
      eager: true,
    },
  )
  phaseToClassroom: PhaseToClassroom[];
}
