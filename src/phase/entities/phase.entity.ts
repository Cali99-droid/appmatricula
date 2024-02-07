import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TypePhase } from '../enum/type-phase.enum';
import { Year } from 'src/years/entities/year.entity';

@Entity()
export class Phase {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column({
    type: 'enum',
    enum: TypePhase,
  })
  type: TypePhase;

  @ManyToOne(() => Year, (year) => year.phase, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'yearId' })
  year?: Year;
}
