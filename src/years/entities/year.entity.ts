import { ApiProperty } from '@nestjs/swagger';
import { Campus } from '../../campus/entities/campus.entity';
import { Phase } from '../../phase/entities/phase.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Holiday } from 'src/holiday/entities/holiday.entity';
import { EnrollmentSchedule } from 'src/enrollment_schedule/entities/enrollment_schedule.entity';
import { Ascent } from 'src/enrollment/entities/ascent.entity';

@Entity()
export class Year {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '2023',
    description: 'Name of year',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: true,
  })
  name: string;

  @ApiProperty({
    example: '2023-01-01',
    description: 'start of the year',
  })
  @Column('date')
  startDate: Date;

  @ApiProperty({
    example: '2023-12-31',
    description: 'end of the year',
  })
  @Column('date')
  endDate: Date;

  @ApiProperty({
    example: 'true',
    description: 'status of the year',
  })
  @Column('bool', {
    default: true,
  })
  status: boolean;

  @ApiProperty({
    // example: [
    //   {
    //     id: 31,
    //     startDate: '2024-06-01',
    //     endDate: '2024-08-31',
    //     type: 'REGULAR',
    //   },
    //   {
    //     id: 32,
    //     startDate: '2024-06-01',
    //     endDate: '2024-08-31',
    //     type: 'RECUPERACION',
    //   },
    // ],
    description: 'array of phases ',
  })
  @OneToMany(() => Phase, (phase) => phase.year, {
    // cascade: true,
    // eager: true,
  })
  phase?: Phase[];

  @OneToMany(() => Ascent, (ascent) => ascent.year, {
    // cascade: true,
    // eager: true,
  })
  ascent?: Ascent[];

  @ApiProperty({
    description: 'array of Campus by Year ',
  })
  @OneToMany(() => Campus, (campus) => campus.year, {
    // cascade: true,
    // eager: true,
  })
  campus?: Campus[];

  // @BeforeInsert()
  // async changeStatus() {
  //   if (this.status) {
  //     const years =
  //     console.log('se interso verdadero');
  //   }
  // }
  @OneToMany(() => Holiday, (holiday) => holiday.year, {
    // eager: true,
  })
  holiday?: Holiday[];

  @ApiProperty({
    description: 'array of enrollmentSchedule ',
  })
  @OneToMany(
    () => EnrollmentSchedule,
    (enrollmentSchedule) => enrollmentSchedule.year,
    {
      // cascade: true,
      // eager: true,
    },
  )
  enrollmentSchedule?: EnrollmentSchedule[];

  // @OneToMany(() => Course, (course) => course.year, {
  //   // eager: true,
  // })
  // course?: Course[];
}
