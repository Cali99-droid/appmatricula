import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CampusXLevelGrade } from 'src/campus_x_level_grade/entities/campus_x_level_grade.entity';
@Entity()
export class Campus {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({
    example: 'SEDE AV EJERCITO',
    description: 'Name of campus',
    uniqueItems: true,
  })
  @Column('varchar', {
    unique: true,
  })
  name: string;
  @ApiProperty({
    description: 'Ugel local code of campus',
  })
  @Column('varchar', {
    unique: true,
  })
  ugelLocalCode: string;
  @ApiProperty({
    example: '20',
    description: 'Number of classrooms in the of campus',
  })
  @Column('int')
  classRooms: number;
  @ApiProperty({
    description: 'Country of campus',
  })
  @Column('varchar')
  country: string;
  @ApiProperty({
    description: 'Departament of campus',
  })
  @Column('varchar')
  departamnt: string;
  @ApiProperty({
    description: 'Province of campus',
  })
  @Column('varchar')
  province: string;
  @ApiProperty({
    description: 'District of campus',
  })
  @Column('varchar')
  district: string;
  @ApiProperty({
    description: 'Address of campus',
  })
  @Column('varchar')
  address: string;
  @ApiProperty({
    description: 'Cellphone of campus',
  })
  @Column('varchar')
  cellphone: string;
  @ApiProperty({
    description: 'Email of campus',
  })
  @Column('varchar')
  email: string;
  @ApiProperty({
    description: 'Array of Campus by Level and Grade ',
  })
  @ApiProperty({
    description: 'WebPage of campus',
  })
  @Column('varchar')
  webPage: string;
  @ApiProperty({
    description: 'Array of Campus by Level and Grade ',
  })
  @OneToMany(() => CampusXLevelGrade, (campus) => campus.campus, {
    // cascade: true,
    // eager: true,
  })
  CampusByLevelGrade?: CampusXLevelGrade[];
}
