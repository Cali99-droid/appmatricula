import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Level } from 'src/level/entities/level.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import { Campus } from 'src/campus/entities/campus.entity';

@Entity()
export class CampusXLevelGrade {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Campus, (campus) => campus.CampusByLevelGrade)
  @JoinColumn({ name: 'campusId' })
  campus?: Campus;
  @ManyToOne(() => Level, (year) => year.CampusByLevelGrade)
  @JoinColumn({ name: 'levelId' })
  level?: Level;
  @ManyToOne(() => Grade, (grade) => grade.CampusByLevelGrade)
  @JoinColumn({ name: 'gradeId' })
  grade?: Grade;
}
