import {
  Column,
  CreateDateColumn,
  Entity,
  //   OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('grade')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 45 })
  name: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn()
  created: Date;

  //   @OneToMany(() => Product, (product) => product.category)
  //   products: Product[];
}
