import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Grade } from 'src/grade/entities/grade.entity';
import { CampusXLevel } from 'src/campus_x_level/entities/campus_x_level.entity';
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
  @OneToMany(() => CampusXLevel, (campus) => campus.level, {
    // cascade: true,
    // eager: true,
  })
  campusXlevel?: CampusXLevel[];

  @ApiProperty({
    description: 'array of Grade by Level ',
  })
  @OneToMany(() => Grade, (grade) => grade.level, {
    // cascade: true,
    // eager: true,
  })
  grade?: Grade[];
}
