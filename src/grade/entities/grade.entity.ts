import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Level } from 'src/level/entities/level.entity';
import { Classroom } from 'src/classroom/entities/classroom.entity';
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

  @ManyToOne(() => Level, (level) => level.grade, {
    eager: true,
  })
  @JoinColumn({ name: 'levelId' })
  level?: Level;

  @OneToMany(() => Classroom, (classroom) => classroom.grade, {
    // cascade: true,
    // eager: true,
  })
  classroom?: Classroom[];
}
