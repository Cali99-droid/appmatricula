import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TypePhase } from '../enum/type-phase.enum';
import { Year } from '../../years/entities/year.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ActivityClassroom } from '../../activity_classroom/entities/activity_classroom.entity';

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
  @Column('bool', {
    default: true,
  })
  status: boolean;

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
    () => ActivityClassroom,
    (activityClassroom) => activityClassroom.phase,
  )
  activityClassroom: ActivityClassroom[];
}
