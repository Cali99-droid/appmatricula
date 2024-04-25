import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Level } from '../../level/entities/level.entity';
import { Campus } from '../../campus/entities/campus.entity';
@Entity()
export class CampusToLevel {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  campusId: number;

  @Column()
  levelId: number;
  @ManyToOne(() => Campus, (campus) => campus.campusToLevel, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  campus?: Campus;
  @ManyToOne(() => Level, (level) => level.campusToLevel, {
    eager: true,
  })
  level?: Level;
}
