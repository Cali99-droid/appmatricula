import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Level } from 'src/level/entities/level.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Campus } from 'src/campus/entities/campus.entity';
@Entity()
export class CampusXLevel {
  @ApiProperty({
    example: '1',
    description: 'end of the CampusXLevel',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Campus, (campus) => campus.campusXlevel)
  @JoinColumn({ name: 'campusId' })
  campus?: Campus;

  @ManyToOne(() => Level, (level) => level.campusXlevel, {
    eager: true,
  })
  @JoinColumn({ name: 'levelId' })
  level?: Level;
}
