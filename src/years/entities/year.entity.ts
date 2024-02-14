import { ApiProperty } from '@nestjs/swagger';
import { Campus } from 'src/campus/entities/campus.entity';
import { Phase } from 'src/phase/entities/phase.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @ApiProperty({
    description: 'array of Campus by Year ',
  })
  @OneToMany(() => Campus, (campus) => campus.year, {
    // cascade: true,
    // eager: true,
  })
  campus?: Campus[];
}
