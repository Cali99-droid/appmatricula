import { ApiProperty } from '@nestjs/swagger';
import { ActivityClassroom } from '../../activity_classroom/entities/activity_classroom.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Campus } from 'src/campus/entities/campus.entity';
import { Level } from 'src/level/entities/level.entity';
import { Shift } from 'src/attendance/enum/shift.enum';
@Entity()
export class SchoolShift {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Mañana',
    description: 'Name of school_shift',
    uniqueItems: true,
  })
  @Column('varchar', {
    // unique: true,
  })
  name: string;
  @Column({ type: 'enum', enum: Shift, nullable: true })
  shift: Shift;
  @ApiProperty({
    example: '08:00:00',
    description: 'start of the school shift',
  })
  @Column({ type: 'time' })
  startTime: string;
  @ApiProperty({
    example: '13:20:00',
    description: 'end of the school shift',
  })
  @Column({ type: 'time' })
  endTime: string;

  @ManyToOne(() => Campus, (campus) => campus.schoolShift, {
    eager: true,
  })
  @JoinColumn({ name: 'campusId' })
  campus?: Campus;

  @ManyToOne(() => Level, (level) => level.schoolShift, {
    eager: true,
  })
  @JoinColumn({ name: 'levelId' })
  level?: Level;

  @OneToMany(
    () => ActivityClassroom,
    (activityClassroom) => activityClassroom.schoolShift,
    {
      // cascade: true,
      // eager: true,
    },
  )
  activityClassroom?: ActivityClassroom[];
}
