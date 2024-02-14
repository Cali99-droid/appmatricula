import { ApiProperty } from '@nestjs/swagger';
import { Classroom } from 'src/classroom/entities/classroom.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class SchoolShift {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Mañana',
    description: 'Name of school_shift',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: true,
  })
  name: string;

  @ApiProperty({
    example: '08:00:00',
    description: 'start of the school shift',
  })
  @Column({ type: 'time' })
  startTime: string;
  @ApiProperty({
    example: '13:20:00',
    description: 'end of the school shift',
  })
  @Column({ type: 'time' })
  endTime: string;

  @OneToMany(() => Classroom, (classroom) => classroom.schoolShift, {
    // cascade: true,
    // eager: true,
  })
  classroom?: Classroom[];
}
