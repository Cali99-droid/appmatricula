import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityClassroom } from '../../activity_classroom/entities/activity_classroom.entity';
import { DayOfWeek } from 'src/day_of_week/entities/day_of_week.entity';
@Entity()
export class Schedule {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Tarde',
    description: 'Shift of schedule',
    nullable: true,
  })
  @Column('varchar')
  shift: string;

  @ApiProperty({
    example: '15:00:00',
    description: 'start of the schedule',
  })
  @Column({ type: 'time' })
  startTime: string;
  @ApiProperty({
    example: '19:20:00',
    description: 'end of the schedule',
  })
  @Column({ type: 'time' })
  endTime: string;

  @ManyToOne(
    () => ActivityClassroom,
    (activityClassroom) => activityClassroom.schedule,
    {
      eager: true,
    },
  )
  @JoinColumn({ name: 'activityClassroomId' })
  activityClassroom?: ActivityClassroom;

  @ManyToOne(() => DayOfWeek, (dayOfWeek) => dayOfWeek.schedule, {
    eager: true,
  })
  @JoinColumn({ name: 'dayOfWeekId' })
  dayOfWeek?: DayOfWeek;
}
