import { ApiProperty } from '@nestjs/swagger';
import { Course } from 'src/academic_structure/course/entities/course.entity';
import { Level } from 'src/level/entities/level.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Area {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '2023',
    description: 'Name of area',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: true,
  })
  name: string;

  @ManyToOne(() => Level, (level) => level.area, {
    eager: true,
  })
  @JoinColumn({ name: 'levelId' })
  level?: Level;

  @ApiProperty({
    example: 'true',
    description: 'status of the area',
  })
  @Column('bool', {
    default: true,
  })
  status: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @OneToMany(() => Course, (course) => course.area, {
    // eager: true,
  })
  course?: Course[];
}
