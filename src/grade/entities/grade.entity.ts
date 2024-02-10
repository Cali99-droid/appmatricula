import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CampusXLevelGrade } from 'src/campus_x_level_grade/entities/campus_x_level_grade.entity';
import { Level } from 'src/level/entities/level.entity';
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

  @ManyToOne(() => Level, (level) => level.grade)
  @JoinColumn({ name: 'levelId' })
  level?: Level;

  @ApiProperty({
    description: 'array of Campus by Level and Grade ',
  })
  @OneToMany(() => CampusXLevelGrade, (campus) => campus.grade, {
    // cascade: true,
    // eager: true,
  })
  CampusByLevelGrade?: CampusXLevelGrade[];
}
