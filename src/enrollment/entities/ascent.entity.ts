import { ApiProperty } from '@nestjs/swagger';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Year } from 'src/years/entities/year.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ascent {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActivityClassroom, (ac) => ac.origin, {
    // eager: true,
  })
  @JoinColumn({ name: 'originId' })
  originId?: ActivityClassroom;

  @ManyToOne(() => ActivityClassroom, (ac) => ac.destination, {
    // eager: true,
  })
  @JoinColumn({ name: 'destinationId' })
  destinationId?: ActivityClassroom;

  @ManyToOne(() => Year, (year) => year.ascent, {
    eager: true,
  })
  @JoinColumn({ name: 'yearId' })
  year?: Year;
}
