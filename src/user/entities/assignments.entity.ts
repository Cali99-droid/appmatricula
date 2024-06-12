import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.assignments)
  user: User;

  @ManyToOne(() => CampusDetail, (campus) => campus.assignments)
  campusDetail: CampusDetail;
}
