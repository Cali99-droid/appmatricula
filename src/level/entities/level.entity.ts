import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Grade } from 'src/grade/entities/grade.entity';
import { Campus } from 'src/campus/entities/campus.entity';
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
  @OneToMany(() => Campus, (campus) => campus.level, {
    // cascade: true,
    // eager: true,
  })
  campus?: Campus[];

  @ApiProperty({
    description: 'array of Grade by Level ',
  })
  @OneToMany(() => Grade, (grade) => grade.level, {
    // cascade: true,
    // eager: true,
  })
  grade?: Grade[];
}
