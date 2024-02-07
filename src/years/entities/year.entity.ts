import { Phase } from 'src/phase/entities/phase.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Year {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    unique: true,
  })
  name: string;

  @Column('date')
  startDate: string;

  @Column('date')
  endDate: string;

  @OneToMany(() => Phase, (phase) => phase.year, {
    cascade: true,
    eager: true,
  })
  phase?: Phase[];
}
