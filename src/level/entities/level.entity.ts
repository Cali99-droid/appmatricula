import {
  Column,
  CreateDateColumn,
  Entity,
  //   OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('level')
export class Level {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn()
  created: Date;

  //   @OneToMany(() => Product, (product) => product.category)
  //   products: Product[];
}
