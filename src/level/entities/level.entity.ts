import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Grade } from '../../grade/entities/grade.entity';
import { CampusToLevel } from '../../campus/entities/campusToLevel.entity';
import { SchoolShift } from 'src/school_shifts/entities/school_shift.entity';
import { Area } from 'src/academic_structure/area/entities/area.entity';
@Entity()
export class Level {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({
    example: '1354568',
    description: 'Modular Code of level',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: true,
  })
  modularCode: string;
  @ApiProperty({
    example: 'primaria',
    description: 'Name of level',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: true,
  })
  name: string;

  @ApiProperty({
    description: 'array of Campus by Level and Grade ',
  })
  @OneToMany(() => CampusToLevel, (campusToLevel) => campusToLevel.level, {
    // cascade: true,
    // eager: true,
  })
  campusToLevel?: CampusToLevel[];

  @ApiProperty({
    description: 'array of Grade by Level ',
  })
  @OneToMany(() => Grade, (grade) => grade.level, {
    // cascade: true,
    // eager: true,
  })
  grade?: Grade[];

  @OneToMany(() => SchoolShift, (schoolShift) => schoolShift.level, {
    // eager: true,
  })
  schoolShift?: SchoolShift[];

  @OneToMany(() => Area, (area) => area.level, {
    // eager: true,
  })
  area?: Area[];
}
