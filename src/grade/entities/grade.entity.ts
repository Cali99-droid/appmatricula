import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Level } from '../../level/entities/level.entity';
import { ActivityClassroom } from '../../activity_classroom/entities/activity_classroom.entity';
import { AreaAssignments } from 'src/area_assignments/entities/area_assignments.entity';
@Entity()
export class Grade {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({
    example: 'primero',
    description: 'Name of grade',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: true,
  })
  name: string;

  @Column('int', {
    unique: false,
  })
  position: number;

  @ManyToOne(() => Level, (level) => level.grade, {
    eager: true,
  })
  @JoinColumn({ name: 'levelId' })
  level?: Level;

  @OneToMany(
    () => ActivityClassroom,
    (activityClassroom) => activityClassroom.grade,
    {
      // cascade: true,
      // eager: true,
    },
  )
  activityClassroom?: ActivityClassroom[];

  @OneToMany(() => AreaAssignments, (area) => area.grade)
  areaAssignments?: AreaAssignments[];
}
